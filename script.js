/* ================================================================
   MIDCAV DIGITAL TECHNOLOGIES — PREMIUM INTERACTION SCRIPT
   Creative Intelligence × Digital Innovation
   ================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   1. CURSOR GLOW (desktop only)
   ──────────────────────────────────────────────────────────────── */
const cursorGlow = document.getElementById('cursor-glow');

if (window.matchMedia('(pointer: fine)').matches && cursorGlow) {
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top  = cy + 'px';
    raf = requestAnimationFrame(animateCursor);
  }
  animateCursor();
} else if (cursorGlow) {
  cursorGlow.style.display = 'none';
}

/* ────────────────────────────────────────────────────────────────
   2. SCROLL PROGRESS BAR
   ──────────────────────────────────────────────────────────────── */
const progressBar = document.getElementById('progress-bar');

function updateProgressBar() {
  const scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct          = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}

window.addEventListener('scroll', updateProgressBar, { passive: true });
updateProgressBar();

/* ────────────────────────────────────────────────────────────────
   3. NAVBAR — SCROLL STATE + ACTIVE LINK
   ──────────────────────────────────────────────────────────────── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');

function updateNavbar() {
  const scrolled = window.scrollY > 60;
  if (navbar) navbar.classList.toggle('scrolled', scrolled);
}

function updateActiveLink() {
  const sections = document.querySelectorAll('section[id], div[id="stats"]');
  let current = '';

  sections.forEach((sec) => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 120) current = sec.id;
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

window.addEventListener('scroll', () => {
  updateNavbar();
  updateActiveLink();
}, { passive: true });

updateNavbar();
updateActiveLink();

/* ────────────────────────────────────────────────────────────────
   4. HAMBURGER / MOBILE NAV
   ──────────────────────────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

function closeMobileNav() {
  if (!hamburger || !mobileNav) return;
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });
}

/* ────────────────────────────────────────────────────────────────
   5. REVEAL ON SCROLL — IntersectionObserver
   ──────────────────────────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ────────────────────────────────────────────────────────────────
   6. WORK FILTER TABS
   ──────────────────────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    workCards.forEach((card) => {
      const cat = card.dataset.cat;
      const show = filter === 'all' || cat === filter;

      if (show) {
        card.classList.remove('hidden');
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 30);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

/* ────────────────────────────────────────────────────────────────
   7. CONTACT FORM SUBMISSION
   ──────────────────────────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm && formSuccess) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.form-submit');
    if (submitBtn) {
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      contactForm.style.display = 'none';
      formSuccess.classList.add('show');
    }, 1200);
  });
}

/* ────────────────────────────────────────────────────────────────
   8. STAT COUNTER ANIMATION
   ──────────────────────────────────────────────────────────────── */
function animateCounter(el, target, suffix, duration) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current + suffix;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

const counterEls = document.querySelectorAll('.stat-block-num[data-count]');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix, 1850);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });

counterEls.forEach((el) => counterObserver.observe(el));

/* ────────────────────────────────────────────────────────────────
   9. SMOOTH SCROLL FOR ANCHOR LINKS
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMobileNav();

    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 85;
    const y = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ────────────────────────────────────────────────────────────────
   10. PARALLAX HERO BACKGROUND & FLOATING CARDS
   ──────────────────────────────────────────────────────────────── */
const heroWaveImg = document.querySelector('.hero-wave-img');
const floatingCards = document.querySelectorAll('.floating-card');

let lastScrollY = 0;
let ticking = false;

function applyParallax() {
  const scrollY = window.scrollY;

  if (heroWaveImg) {
    heroWaveImg.style.transform = `translateY(${scrollY * 0.16}px)`;
  }

  floatingCards.forEach((card, i) => {
    const speed = 0.05 + (i * 0.025);
    // Maintain animation floating offsets and merge with scroll offsets
    card.style.marginTop = `${scrollY * speed}px`;
  });

  ticking = false;
}

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(applyParallax);
    ticking = true;
  }
}, { passive: true });

/* ────────────────────────────────────────────────────────────────
   11. CARDS MOUSE SPOTLIGHT (INTERACTIVE GLOW)
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('.why-card, .wwd-card, .service-card, .feature-card, .partner-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* ────────────────────────────────────────────────────────────────
   12. CAMERA TIMECODE SIMULATOR
   ──────────────────────────────────────────────────────────────── */
const timecodeEl = document.getElementById('live-timecode');

if (timecodeEl) {
  let hrs = 1, mins = 24, secs = 58, frames = 12;

  setInterval(() => {
    frames++;
    if (frames >= 60) {
      frames = 0;
      secs++;
      if (secs >= 60) {
        secs = 0;
        mins++;
        if (mins >= 60) {
          mins = 0;
          hrs++;
          if (hrs >= 24) hrs = 0;
        }
      }
    }

    const pad = (n) => String(n).padStart(2, '0');
    timecodeEl.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  }, 16.67); // ~60fps frame increments
}

/* ────────────────────────────────────────────────────────────────
   13. INITIAL PAGE-LOAD TRIGGER
   ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelectorAll('#home .reveal').forEach((el) => {
      el.classList.add('visible');
    });
  }, 150);
});

/* ────────────────────────────────────────────────────────────────
   14. KEYBOARD ACCESSIBILITY
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('[tabindex="0"]').forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});
