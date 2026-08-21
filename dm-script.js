/**
 * MIDCAV Digital Marketing — dm-script.js
 * Handles: cursor, navbar scroll, mobile menu, scroll reveals,
 *          animated counters, bar chart animation, hover microinteractions
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── CURSOR ─── */
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let cursorX = 0, cursorY = 0, raf;
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate(${cursorX - 6}px, ${cursorY - 6}px)`;
      });
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
    document.querySelectorAll('a, button, [tabindex]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '40px';
        cursor.style.height = '40px';
        cursor.style.background = 'rgba(0,229,255,0.3)';
        cursor.style.border = '1px solid rgba(0,229,255,0.8)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '12px';
        cursor.style.height = '12px';
        cursor.style.background = 'rgba(0,229,255,0.8)';
        cursor.style.border = 'none';
      });
    });
  }

  /* ─── NAVBAR SCROLL ─── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── MOBILE MENU ─── */
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('dm-mobile-menu');
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* ─── SCROLL REVEAL (Intersection Observer) ─── */
  const revealEls = document.querySelectorAll('.reveal-fade, .reveal-image');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children if grid
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el, i) => {
      el.dataset.delay = Math.min(i * 80, 400);
      revealObs.observe(el);
    });
  }

  /* ─── STAGGER CARD ANIMATIONS ─── */
  const staggerGrids = document.querySelectorAll(
    '.dmh-pillars-grid, .dms-cards-grid, .dmst-results-grid'
  );
  staggerGrids.forEach(grid => {
    const children = Array.from(grid.children);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        children.forEach(child => child.classList.add('visible'));
        obs.unobserve(grid);
      }
    }, { threshold: 0.1 });
    // Add reveal-fade class to each child
    children.forEach(child => child.classList.add('reveal-fade'));
    obs.observe(grid);
  });

  /* ─── ANIMATED COUNTERS (Page 3) ─── */
  const counterEls = document.querySelectorAll('.dmst-result-num[data-target]');
  if (counterEls.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterObs.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 2000;
    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = eased * target;
      if (isDecimal) {
        el.textContent = (current / 10).toFixed(1);
      } else {
        el.textContent = Math.round(current);
      }
      if (progress < 1) requestAnimationFrame(step);
      else {
        el.textContent = isDecimal ? (target / 10).toFixed(1) : target;
      }
    };
    requestAnimationFrame(step);
  }

  /* ─── ANALYTICS BAR CHART ANIMATION (Page 2 CSS Art) ─── */
  const bars = document.querySelectorAll('.dsa-bar');
  if (bars.length) {
    const barObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        bars.forEach((bar, i) => {
          bar.style.animation = `dmBarRise 0.8s cubic-bezier(0.2,0.8,0.2,1) ${i * 80}ms both`;
        });
        barObs.unobserve(entries[0].target);
      }
    }, { threshold: 0.5 });
    if (bars[0]) barObs.observe(bars[0].closest('.dms-card') || bars[0]);
  }

  /* ─── PLATFORM BARS ANIMATION (Page 3 Dashboard) ─── */
  const platFills = document.querySelectorAll('.dmst-plat-fill');
  if (platFills.length) {
    // Store widths and reset
    platFills.forEach(fill => {
      fill._targetWidth = fill.style.width;
      fill.style.width = '0%';
    });
    const platObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        platFills.forEach((fill, i) => {
          setTimeout(() => {
            fill.style.width = fill._targetWidth;
          }, i * 150 + 300);
        });
        platObs.unobserve(entries[0].target);
      }
    }, { threshold: 0.3 });
    const dash = document.querySelector('.dmst-dash-wrapper');
    if (dash) platObs.observe(dash);
  }

  /* ─── SERVICE CHIP RIPPLE (Page 1) ─── */
  document.querySelectorAll('.dmh-svc-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;width:200px;height:200px;border-radius:50%;
        background:rgba(0,229,255,0.15);
        transform:translate(-50%,-50%) scale(0);
        animation:ripple 0.6s ease-out forwards;
        pointer-events:none;
      `;
      const rect = chip.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      chip.style.position = 'relative';
      chip.style.overflow = 'hidden';
      chip.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Add ripple keyframe
  if (!document.querySelector('#dm-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'dm-ripple-style';
    style.textContent = `@keyframes ripple { to { transform: translate(-50%,-50%) scale(1); opacity: 0; } }`;
    document.head.appendChild(style);
  }

  /* ─── DM HERO FLOATING CARDS — SMOOTH PARALLAX ─── */
  const floatCards = document.querySelectorAll('.dmh-float-card, .dmh-sparkline-card');
  if (floatCards.length && window.innerWidth > 1024) {
    document.addEventListener('mousemove', (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 10;
      const my = (e.clientY / window.innerHeight - 0.5) * 10;
      floatCards.forEach((card, i) => {
        const factor = (i % 2 === 0) ? 1 : -1;
        card.style.transform = `translate(${mx * factor * 0.5}px, ${my * factor * 0.5}px)`;
      });
    });
  }

  /* ─── PROCESS STEP HOVER — NEON BORDER TRAIL ─── */
  document.querySelectorAll('.dmh-process-item, .dmst-step').forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.setProperty('--neon-opacity', '1');
    });
    item.addEventListener('mouseleave', () => {
      item.style.setProperty('--neon-opacity', '0');
    });
  });

  /* ─── SERVICE CARDS TILT EFFECT (Page 2) ─── */
  if (window.innerWidth > 768) {
    document.querySelectorAll('.dms-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-12px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ─── SUBNAV ACTIVE HIGHLIGHT ON SCROLL ─── */
  // Already handled via active class in HTML

  /* ─── CONSOLE BRANDING ─── */
  console.log(
    '%cMIDCAV Digital Marketing\n%cPowered by strategy, creativity & data.',
    'color:#00e5ff;font-size:18px;font-weight:900;',
    'color:rgba(255,255,255,0.5);font-size:12px;'
  );

});
