/* ═══════════════════════════════════════════════════════════════
   MIDCAV DIGITAL — Premium JS Interactions
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────── */
/*  CUSTOM CURSOR                                                  */
/* ─────────────────────────────────────────────────────────────── */
(function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Ignore on touch devices

  const cursor = document.getElementById('cursor-follower');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function update() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(update);
  }
  update();
})();

/* ─────────────────────────────────────────────────────────────── */
/*  THEME TOGGLE                                                   */
/* ─────────────────────────────────────────────────────────────── */
(function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const storageKey = 'midcav-theme';

  const savedTheme = localStorage.getItem(storageKey);
  const sysPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = 'dark';
  if (savedTheme === 'light' || (!savedTheme && !sysPref)) {
    currentTheme = 'light';
  }

  function applyTheme(theme, animate = false) {
    if (animate) {
      html.classList.add('theme-transitioning');
      setTimeout(() => html.classList.remove('theme-transitioning'), 500);
    }
    
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
      if(toggleBtn) {
        toggleBtn.querySelector('.icon-sun').style.display = 'none';
        toggleBtn.querySelector('.icon-moon').style.display = 'block';
      }
    } else {
      html.removeAttribute('data-theme');
      if(toggleBtn) {
        toggleBtn.querySelector('.icon-sun').style.display = 'block';
        toggleBtn.querySelector('.icon-moon').style.display = 'none';
      }
    }
  }

  applyTheme(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(storageKey, currentTheme);
      applyTheme(currentTheme, true);
    });
  }
})();

/* ─────────────────────────────────────────────────────────────── */
/*  NAVIGATION & MOBILE MENU                                       */
/* ─────────────────────────────────────────────────────────────── */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const menuBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const spans = menuBtn.querySelectorAll('span');
      if (mobileMenu.classList.contains('open')) {
        spans[0].style.transform = 'translateY(4px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-4px) rotate(-45deg)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.transform = 'none';
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.transform = 'none';
      });
    });
  }
})();

/* ─────────────────────────────────────────────────────────────── */
/*  SCROLL REVEAL (Intersection Observer)                          */
/* ─────────────────────────────────────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-fade, .reveal-image, .reveal-text').forEach(el => {
    observer.observe(el);
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  STATS COUNTER                                                  */
/* ─────────────────────────────────────────────────────────────── */
(function initCounters() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const text = target.innerText;
        const num = parseInt(text.replace(/[^0-9]/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        
        if (!isNaN(num)) {
          let start = 0;
          const duration = 2000;
          const startTime = performance.now();
          
          function updateCounter(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // easeOutQuart
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (num - start) * ease);
            target.innerText = current + suffix;
            
            if (progress < 1) requestAnimationFrame(updateCounter);
            else target.innerText = text;
          }
          requestAnimationFrame(updateCounter);
        }
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────────────────────── */
/*  PORTFOLIO FILTERING                                            */
/* ─────────────────────────────────────────────────────────────── */
(function initPortfolio() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.masonry-item');
  
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        if (filter === 'all' || item.classList.contains(filter)) {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  SMOOTH ANCHOR SCROLLING                                        */
/* ─────────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = 80; // --nav-h
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    }
  });
});

/* ─────────────────────────────────────────────────────────────── */
/*  3D CUBE CAROUSEL STAGE INTERACTION                             */
/* ─────────────────────────────────────────────────────────────── */
(function initCubeCarouselStage() {
  const stage = document.getElementById('cubeStage');
  if (!stage) return;

  const cubes = stage.querySelectorAll('.cube-3d-box');
  const slots = stage.querySelectorAll('.stage-cube-slot');
  const prevBtn = document.getElementById('stagePrev');
  const nextBtn = document.getElementById('stageNext');

  // Click cube to switch focal hero highlight
  cubes.forEach((cube) => {
    cube.addEventListener('click', () => {
      slots.forEach(s => s.classList.remove('focal-hero'));
      const parentSlot = cube.closest('.stage-cube-slot');
      if (parentSlot) parentSlot.classList.add('focal-hero');
    });
  });

  // Stage navigation buttons
  let manualOffset = 0;
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      manualOffset -= 90;
      slots.forEach((slot) => {
        const box = slot.querySelector('.cube-3d-box');
        if (box) {
          box.style.animation = 'none';
          box.style.transform = `rotateY(${manualOffset}deg)`;
        }
      });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      manualOffset += 90;
      slots.forEach((slot) => {
        const box = slot.querySelector('.cube-3d-box');
        if (box) {
          box.style.animation = 'none';
          box.style.transform = `rotateY(${manualOffset}deg)`;
        }
      });
    });
  }
})();

/* ─────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────── */
/*  DIGITAL MARKETING 4-SLIDE INTERACTIVE CONTROLLER               */
/* ─────────────────────────────────────────────────────────────── */
(function initDMSlider() {
  const sliderWrap = document.querySelector('.dm-slider-wrap');
  if (!sliderWrap) return;

  const track = document.getElementById('dmSlideTrack');
  const slides = sliderWrap.querySelectorAll('.dm-slide-card');
  const pills = sliderWrap.querySelectorAll('.dm-nav-pill');
  const dots = sliderWrap.querySelectorAll('.dm-dot');
  const prevBtn = document.getElementById('dmSlidePrev');
  const nextBtn = document.getElementById('dmSlideNext');

  let currentSlide = 0;
  const totalSlides = slides.length;
  if (totalSlides === 0) return;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    currentSlide = index;

    // Move track smoothly
    if (track) {
      track.style.transform = `translate3d(-${currentSlide * 100}%, 0, 0)`;
    }

    // Update active class on slides
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update nav pills
    pills.forEach((pill, i) => {
      if (i === currentSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update dots
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // Pill click listeners
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const slideIndex = parseInt(pill.getAttribute('data-slide'), 10);
      if (!isNaN(slideIndex)) {
        goToSlide(slideIndex);
      }
    });
  });

  // Dot click listeners
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const dotIndex = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(dotIndex)) {
        goToSlide(dotIndex);
      }
    });
  });

  // Arrow click listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });
  }

  // Touch Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  sliderWrap.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderWrap.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX - touchEndX;
    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance > 0) {
        goToSlide(currentSlide + 1); // Swipe left -> Next
      } else {
        goToSlide(currentSlide - 1); // Swipe right -> Prev
      }
    }
  }, { passive: true });

  // Initialize first slide
  goToSlide(0);
})();

console.log('%c MIDCAV . %c Premium Digital & Creative Agency', 'background:#8952ff;color:#fff;padding:4px 8px;font-weight:bold;border-radius:4px;', 'color:#8952ff;');

