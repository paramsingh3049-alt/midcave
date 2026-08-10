/* ================================================================
   MIDCAV DIGITAL TECHNOLOGIES — PREMIUM INTERACTION SCRIPT
   Creative Intelligence × Digital Innovation
   ================================================================ */

'use strict';

/* ────────────────────────────────────────────────────────────────
   1. CURSOR GLOW (desktop)
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
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

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

  // Close on link click
  mobileNav.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on Escape
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
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ────────────────────────────────────────────────────────────────
   6. WORK FILTER TABS
   ──────────────────────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workCards  = document.querySelectorAll('.work-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Active state
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    workCards.forEach((card) => {
      const cat = card.dataset.cat;
      const show = filter === 'all' || cat === filter;

      if (show) {
        card.classList.remove('hidden');
        // Stagger re-reveal
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

    // Simulate async send
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
    // Ease out cubic
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
      animateCounter(el, target, suffix, 1800);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

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

    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 80;
    const y = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

/* ────────────────────────────────────────────────────────────────
   10. PARALLAX HERO BACKGROUND
   ──────────────────────────────────────────────────────────────── */
const heroWaveImg = document.querySelector('.hero-wave-img');
const heroOrbs    = document.querySelectorAll('.hero-orb');

let lastScrollY = 0;
let ticking = false;

function applyParallax() {
  const scrollY = window.scrollY;

  if (heroWaveImg) {
    heroWaveImg.style.transform = `translateY(${scrollY * 0.18}px)`;
  }

  heroOrbs.forEach((orb, i) => {
    const speed = 0.08 + i * 0.04;
    orb.style.transform = `translateY(${scrollY * speed}px)`;
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
   11. HERO CHIPS — HOVER GLOW RIPPLE
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('.hero-chip').forEach((chip) => {
  chip.addEventListener('mouseenter', () => {
    chip.style.boxShadow = '0 0 16px rgba(0,242,254,0.2)';
  });
  chip.addEventListener('mouseleave', () => {
    chip.style.boxShadow = '';
  });
});

/* ────────────────────────────────────────────────────────────────
   12. FLOATING CARDS — SUBTLE MOUSE PARALLAX
   ──────────────────────────────────────────────────────────────── */
const heroRight = document.querySelector('.hero-right');

if (heroRight && window.matchMedia('(pointer: fine)').matches) {
  heroRight.addEventListener('mousemove', (e) => {
    const rect = heroRight.getBoundingClientRect();
    const cx   = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy   = (e.clientY - rect.top)  / rect.height - 0.5;

    const mainCard = heroRight.querySelector('.floating-card-main');
    const miniCard = heroRight.querySelector('.mini-stat-card');

    if (mainCard) {
      mainCard.style.transform = `translate(-50%, -50%) rotate(${-2 + cy * 3}deg) rotateY(${cx * 6}deg) translateY(0px)`;
    }
    if (miniCard) {
      miniCard.style.transform = `rotate(${cx * 2}deg) translateY(${cy * -8}px)`;
    }
  });

  heroRight.addEventListener('mouseleave', () => {
    const mainCard = heroRight.querySelector('.floating-card-main');
    const miniCard = heroRight.querySelector('.mini-stat-card');
    if (mainCard) mainCard.style.transform = '';
    if (miniCard) miniCard.style.transform = '';
  });
}

/* ────────────────────────────────────────────────────────────────
   13. PARTNER CARDS — INTERACTIVE HIGHLIGHT
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('.partner-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,242,254,0.04), rgba(255,255,255,0.03) 50%)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* ────────────────────────────────────────────────────────────────
   14. WHY CARDS — INTERACTIVE HIGHLIGHT
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('.why-card, .wwd-card, .service-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* ────────────────────────────────────────────────────────────────
   15. KEYBOARD ACCESSIBILITY
   ──────────────────────────────────────────────────────────────── */
document.querySelectorAll('[tabindex="0"]').forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});

/* ────────────────────────────────────────────────────────────────
   16. INITIAL PAGE-LOAD ANIMATION
   ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Trigger hero elements immediately after load
  setTimeout(() => {
    document.querySelectorAll('#home .reveal').forEach((el) => {
      el.classList.add('visible');
    });
  }, 200);
});

/* ────────────────────────────────────────────────────────────────
   17. ECOSYSTEM RINGS — MOUSE TILT
   ──────────────────────────────────────────────────────────────── */
const ecoVisual = document.querySelector('.ecosystem-visual');
if (ecoVisual) {
  ecoVisual.addEventListener('mousemove', (e) => {
    const rect = ecoVisual.getBoundingClientRect();
    const cx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const cy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    ecoVisual.style.transform = `perspective(800px) rotateX(${-cy * 4}deg) rotateY(${cx * 4}deg)`;
  });
  ecoVisual.addEventListener('mouseleave', () => {
    ecoVisual.style.transform = '';
  });
}

/* ────────────────────────────────────────────────────────────────
   18. TICKER SPEED — PAUSE ON HOVER
   ──────────────────────────────────────────────────────────────── */
const tickerTrack = document.querySelector('.ticker-track');
if (tickerTrack) {
  tickerTrack.addEventListener('mouseenter', () => {
    tickerTrack.style.animationPlayState = 'paused';
  });
  tickerTrack.addEventListener('mouseleave', () => {
    tickerTrack.style.animationPlayState = 'running';
  });
}

/* ────────────────────────────────────────────────────────────────
   19. CTA SECTION — GLOWING ORB MOUSE TRACKING
   ──────────────────────────────────────────────────────────────── */
const ctaSection = document.getElementById('cta');
const ctaOrb     = document.querySelector('.cta-bg-orb');

if (ctaSection && ctaOrb && window.matchMedia('(pointer: fine)').matches) {
  ctaSection.addEventListener('mousemove', (e) => {
    const rect = ctaSection.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    ctaOrb.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(1.05)`;
  });
  ctaSection.addEventListener('mouseleave', () => {
    ctaOrb.style.transform = 'translate(-50%, -50%)';
  });
}
