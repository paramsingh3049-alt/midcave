// Supabase Edge Function: send-contact-email
// Triggered on contact form submissions to notify admin via Resend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
// By default, Resend allows sending from 'onboarding@resend.dev' until you verify your custom domain
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") || "MIDCAV Inquiries <onboarding@resend.dev>";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { name, company, email, type, message } = payload;

    // Validate required environment secrets
    if (!RESEND_API_KEY || !ADMIN_EMAIL) {
      console.error("Missing required secrets: RESEND_API_KEY and/or ADMIN_EMAIL in Supabase environment.");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing email secrets in Supabase." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: save to Supabase database if SUPABASE_SERVICE_ROLE_KEY is present and not already saved
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseServiceKey && payload.saveToDb !== false) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("contacts").insert([
          {
            name,
            company: company || "N/A",
            email,
            project_type: type || "General",
            message,
          },
        ]);
      } catch (dbErr) {
        console.error("Database insert error inside Edge Function:", dbErr);
      }
    }

    // Prepare email HTML template
    const submittedAt = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Lead - MIDCAV</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #ffffff; margin: 0; padding: 30px 15px; }
        .card { max-width: 600px; margin: 0 auto; background: #13141c; border: 1px solid #2a2b3d; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #8952ff 0%, #6025e6 100%); padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #ffffff; text-transform: uppercase; }
        .header p { margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; border-bottom: 1px solid #1f202e; padding-bottom: 15px; }
        .field:last-child { border-bottom: none; }
        .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #8952ff; font-weight: 700; margin-bottom: 6px; }
        .value { font-size: 16px; color: #f1f1f5; line-height: 1.5; }
        .message-box { background: #0b0c10; border: 1px solid #2a2b3d; border-radius: 8px; padding: 15px; font-size: 15px; color: #e4e4ed; white-space: pre-wrap; line-height: 1.6; }
        .btn-reply { display: inline-block; background: #8952ff; color: #ffffff !important; text-decoration: none; padding: 12px 26px; border-radius: 6px; font-weight: 700; font-size: 14px; margin-top: 20px; }
        .footer { padding: 20px 30px; background: #0c0d13; text-align: center; font-size: 12px; color: #6e7087; border-top: 1px solid #1f202e; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>MIDCAV</h1>
          <p>⚡ New Contact Form Submission Received</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Full Name</div>
            <div class="value"><strong>${escapeHtml(name)}</strong></div>
          </div>
          <div class="field">
            <div class="label">Company / Brand</div>
            <div class="value">${escapeHtml(company || "Not provided")}</div>
          </div>
          <div class="field">
            <div class="label">Email Address</div>
            <div class="value"><a href="mailto:${escapeHtml(email)}" style="color: #a77dfa; text-decoration: none;">${escapeHtml(email)}</a></div>
          </div>
          <div class="field">
            <div class="label">Project Type</div>
            <div class="value"><span style="background: rgba(137,82,255,0.15); color: #c4a6ff; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 600;">${escapeHtml(type || "General")}</span></div>
          </div>
          <div class="field">
            <div class="label">Project Details / Message</div>
            <div class="message-box">${escapeHtml(message)}</div>
          </div>
          <div style="text-align: center;">
            <a href="mailto:${escapeHtml(email)}?subject=Re:%20Your%20Inquiry%20to%20MIDCAV" class="btn-reply">Reply to ${escapeHtml(name)} &rarr;</a>
          </div>
        </div>
        <div class="footer">
          Received on ${submittedAt} (IST) &bull; Submitted via MIDCAV Web Form
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email using Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [ADMIN_EMAIL],
        reply_to: email,
        subject: `🚀 New Lead: ${name} (${type || "General"}) - MIDCAV`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API Error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email notification", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Inquiry received and notification sent!", resendId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
