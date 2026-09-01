/**
 * MIDCAV — Supabase & Resend Integration Handler
 * Handles contact form submissions, stores leads in Supabase, and triggers email notifications.
 */

// ==============================================================================
// 1. SUPABASE CONFIGURATION
// Replace the placeholder values with your Supabase Project URL and Anon/Public Key.
// Found in your Supabase Dashboard: Project Settings -> API
// ==============================================================================
window.MIDCAV_SUPABASE_CONFIG = {
  url: "https://jxfukjvyjlhjqceqhsfh.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4ZnVranZ5amxoanFjZXFoc2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjcxNzYsImV4cCI6MjEwMzg0MzE3Nn0.6MYpqM_KJCAoq3_4Qx175I523tiWmRZ80C7GOGdeEzE"
};

(function initContactFormHandler() {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Start a Project';
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    // Create error message element if not already present
    let errorBox = errorMsg;
    if (!errorBox) {
      errorBox = document.createElement('div');
      errorBox.id = 'form-error';
      errorBox.className = 'form-feedback form-error';
      errorBox.style.display = 'none';
      form.appendChild(errorBox);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous status messages
      if (successMsg) successMsg.style.display = 'none';
      if (errorBox) errorBox.style.display = 'none';

      // Extract input values
      const name = (document.getElementById('name')?.value || '').trim();
      const company = (document.getElementById('company')?.value || '').trim();
      const email = (document.getElementById('email')?.value || '').trim();
      const type = (document.getElementById('type')?.value || 'Digital Marketing').trim();
      const message = (document.getElementById('message')?.value || '').trim();

      // Basic validation
      if (!name || !email || !message) {
        showError('Please fill in all required fields (Name, Email, Message).');
        return;
      }

      // Check configuration
      const config = window.MIDCAV_SUPABASE_CONFIG;
      const isConfigured = config && 
        config.url && 
        config.anonKey && 
        !config.url.includes('YOUR_SUPABASE_PROJECT_URL');

      // Set Loading State
      setLoading(true);

      try {
        if (!window.supabase) {
          throw new Error('Supabase client library is not loaded.');
        }

        if (!isConfigured) {
          console.warn('⚠️ Supabase credentials are not configured in supabase-client.js. Please add your Supabase URL and Anon Key.');
          // Provide an informative message during initial setup
          throw new Error('Please configure your Supabase Project URL and Anon Key in supabase-client.js');
        }

        // Initialize Supabase Client
        const supabase = window.supabase.createClient(config.url, config.anonKey);

        // 1. Insert into Supabase 'contacts' table
        const { error: dbError } = await supabase
          .from('contacts')
          .insert([
            {
              name: name,
              company: company || 'N/A',
              email: email,
              project_type: type,
              message: message,
              status: 'new'
            }
          ]);

        if (dbError) {
          console.error('Supabase DB Insert Error:', dbError);
          throw new Error(dbError.message || 'Failed to save form submission to database.');
        }

        // 2. Trigger Supabase Edge Function to send email via Resend
        try {
          const { data: funcData, error: funcError } = await supabase.functions.invoke('send-contact-email', {
            body: {
              name,
              company,
              email,
              type,
              message,
              saveToDb: false // Already saved above
            }
          });

          if (funcError) {
            console.warn('Edge Function Notice:', funcError);
          } else {
            console.log('Resend Notification Success:', funcData);
          }
        } catch (funcErr) {
          console.warn('Edge function invoke error (check if function is deployed):', funcErr);
        }

        // Show Success Feedback
        showSuccess('Thank you! Your project request has been received. Our team will get back to you shortly.');
        form.reset();

      } catch (err) {
        console.error('Submission error:', err);
        showError(err.message || 'Something went wrong while submitting. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    function setLoading(isLoading) {
      if (!submitBtn) return;
      if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
        submitBtn.innerHTML = '<span class="spinner"></span> <span>Sending Request...</span>';
      } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerHTML = originalBtnHtml;
      }
    }

    function showSuccess(msg) {
      if (successMsg) {
        successMsg.textContent = msg;
        successMsg.style.display = 'block';
        successMsg.className = 'form-feedback form-success';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function showError(msg) {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });
})();
