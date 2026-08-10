/**
 * MIDCAV DIGITAL TECHNOLOGIES
 * Premium Website JavaScript
 * Creative Intelligence × Digital Innovation
 */

'use strict';

/* =====================================================
   PROGRESS BAR
   ===================================================== */
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
}

window.addEventListener('scroll', updateProgressBar, { passive: true });

/* =====================================================
   NAVBAR SCROLL EFFECT
   ===================================================== */
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run on load

/* =====================================================
   ACTIVE NAV LINK HIGHLIGHT
   ===================================================== */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a:not(.nav-cta)');

function highlightActiveNav() {
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId     = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightActiveNav, { passive: true });

/* =====================================================
   HAMBURGER / MOBILE MENU
   ===================================================== */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
const mobileLinks = document.querySelectorAll('.mobile-link');

function toggleMenu() {
  const isOpen = hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', toggleMenu);

mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on outside click
mobileNav.addEventListener('click', (e) => {
  if (e.target === mobileNav) closeMenu();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
});

/* =====================================================
   SCROLL REVEAL ANIMATIONS
   ===================================================== */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

/* =====================================================
   PORTFOLIO FILTER
   ===================================================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    workCards.forEach(card => {
      const cat = card.getAttribute('data-cat');

      if (filter === 'all' || cat === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeInCard 0.45s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Inject fadeInCard keyframe
const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(`
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {}

/* =====================================================
   CONTACT FORM
   ===================================================== */
const contactForm    = document.getElementById('contact-form');
const formSuccess    = document.getElementById('form-success');
const submitBtn      = document.getElementById('contact-submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameField    = document.getElementById('contact-name');
    const emailField   = document.getElementById('contact-email');
    const messageField = document.getElementById('contact-message');

    // Simple validation
    let valid = true;

    [nameField, emailField, messageField].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(255, 80, 80, 0.5)';
        field.style.boxShadow   = '0 0 0 3px rgba(255,80,80,0.08)';
        valid = false;
      } else {
        field.style.borderColor = '';
        field.style.boxShadow   = '';
      }
    });

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value && !emailRegex.test(emailField.value)) {
      emailField.style.borderColor = 'rgba(255, 80, 80, 0.5)';
      emailField.style.boxShadow   = '0 0 0 3px rgba(255,80,80,0.08)';
      valid = false;
    }

    if (!valid) return;

    // Simulate submission
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled    = true;

    setTimeout(() => {
      contactForm.style.display = 'none';
      formSuccess.classList.add('show');
      submitBtn.textContent = 'Start A Conversation →';
      submitBtn.disabled    = false;
    }, 1400);
  });

  // Live validation reset on input
  contactForm.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
      field.style.boxShadow   = '';
    });
  });
}

/* =====================================================
   DISCIPLINE CARD INTERACTION
   ===================================================== */
const disciplineCards = document.querySelectorAll('.discipline-card');

disciplineCards.forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

/* =====================================================
   SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ===================================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href   = anchor.getAttribute('href');
    const target = href === '#' ? null : document.querySelector(href);

    if (target) {
      e.preventDefault();
      closeMenu(); // Close mobile menu if open

      const targetTop  = target.getBoundingClientRect().top + window.scrollY;
      const navHeight  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      const offsetTop  = targetTop - navHeight - 20;

      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  });
});

/* =====================================================
   TICKER PAUSE ON HOVER
   ===================================================== */
const tickerTrack = document.querySelector('.ticker-track');
const heroTicker  = document.querySelector('.hero-ticker');

if (heroTicker && tickerTrack) {
  heroTicker.addEventListener('mouseenter', () => {
    tickerTrack.style.animationPlayState = 'paused';
  });
  heroTicker.addEventListener('mouseleave', () => {
    tickerTrack.style.animationPlayState = 'running';
  });
}

/* =====================================================
   ANIMATED COUNTER (Stats)
   ===================================================== */
function animateCounter(el, target, duration = 1500) {
  const startTime = performance.now();
  const isSymbol  = isNaN(parseInt(target));

  if (isSymbol) return; // Skip non-numeric like "∞"

  const numTarget = parseInt(target);
  const suffix    = target.replace(/[0-9]/g, '');

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease out
    const current  = Math.floor(eased * numTarget);
    el.textContent = current + suffix;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

// Observe stats section and trigger counters
const statNumbers = document.querySelectorAll('.stat-number');

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = el.textContent.trim();
      animateCounter(el, target);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => statsObserver.observe(el));

/* =====================================================
   PARTNER CARD LINKS
   ===================================================== */
const partnerCards = document.querySelectorAll('.partner-card');

partnerCards.forEach(card => {
  card.addEventListener('click', () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const navHeight = 80;
      const top = contactSection.getBoundingClientRect().top + window.scrollY - navHeight - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

/* =====================================================
   ECOSYSTEM RINGS — PARALLAX MOUSE EFFECT
   ===================================================== */
const ecosystemSection = document.getElementById('ecosystem');

if (ecosystemSection) {
  ecosystemSection.addEventListener('mousemove', (e) => {
    const rect    = ecosystemSection.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;

    const dx = (e.clientX - centerX) / rect.width;
    const dy = (e.clientY - centerY) / rect.height;

    const rings = ecosystemSection.querySelectorAll('.eco-ring');
    rings.forEach((ring, i) => {
      const factor = (i + 1) * 6;
      ring.style.transform = `translate(calc(-50% + ${dx * factor}px), calc(-50% + ${dy * factor}px))`;
    });
  });

  ecosystemSection.addEventListener('mouseleave', () => {
    const rings = ecosystemSection.querySelectorAll('.eco-ring');
    rings.forEach(ring => {
      ring.style.transform = 'translate(-50%, -50%)';
    });
  });
}

/* =====================================================
   PAGE LOAD — ENTRANCE ANIMATION
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');

  // Trigger first-visible reveals immediately
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('visible');
    }
  });
});

/* =====================================================
   SERVICE CARD — RIPPLE EFFECT
   ===================================================== */
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
  card.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect   = card.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;

    Object.assign(ripple.style, {
      position:        'absolute',
      width:           size + 'px',
      height:          size + 'px',
      left:            x + 'px',
      top:             y + 'px',
      background:      'radial-gradient(circle, rgba(0,242,254,0.15), transparent 70%)',
      borderRadius:    '50%',
      transform:       'scale(0)',
      animation:       'ripple 0.6s ease-out forwards',
      pointerEvents:   'none',
    });

    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Ripple keyframe
try {
  styleSheet.insertRule(`
    @keyframes ripple {
      to { transform: scale(2.5); opacity: 0; }
    }
  `, styleSheet.cssRules.length);
} catch(e) {}

/* =====================================================
   WHY CARD — MAGNETIC HOVER EFFECT
   ===================================================== */
const whyCards = document.querySelectorAll('.why-card');

whyCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y      = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;
    card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* =====================================================
   FOOTER YEAR AUTO-UPDATE
   ===================================================== */
const yearSpans = document.querySelectorAll('.footer-year');
yearSpans.forEach(span => { span.textContent = new Date().getFullYear(); });

/* =====================================================
   GLOBAL KEYBOARD NAVIGATION
   ===================================================== */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});
