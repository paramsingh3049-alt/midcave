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
/*  PREMIUM SMOOTH SCROLLING (LENIS)                               */
/* ─────────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
  script.onload = () => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1, // slightly increased speed
      touchMultiplier: 2,
    });

    // Anchor scrolling via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  };
  document.head.appendChild(script);
})();

/* ─────────────────────────────────────────────────────────────── */
/*  3D CUBE CAROUSEL INTERACTION                                   */
/* ─────────────────────────────────────────────────────────────── */
(function initCubeCarousel() {
  const carousel = document.getElementById('cube-carousel');
  if (!carousel) return;

  const cubes = carousel.querySelectorAll('.cube');
  const totalCubes = cubes.length;
  const theta = 360 / totalCubes;
  let radius = window.innerWidth < 768 ? 180 : 300;

  let currentAngle = 0;
  let targetAngle = 0;
  let isDragging = false;
  let startX = 0;
  let startAngle = 0;
  let animationFrameId = null;

  let isScrolling = false;
  let scrollTimeout = null;
  let interactDelay = 0; // Frames to wait before resuming auto-rotate

  function setupCubes() {
    radius = window.innerWidth < 768 ? 160 : 300;
    cubes.forEach((cube, i) => {
      cube.style.transform = `rotateY(${i * theta}deg) translateZ(${radius}px)`;
    });
    if (!animationFrameId) {
      animationLoop();
    }
  }

  window.addEventListener('resize', setupCubes);

  function animationLoop() {
    if (!isDragging && !isScrolling) {
      if (interactDelay > 0) {
        interactDelay--;
      } else {
        targetAngle -= 0.15; // Auto-scroll speed
      }
    }

    currentAngle += (targetAngle - currentAngle) * 0.08;
    carousel.style.transform = `translateZ(${-radius}px) rotateY(${currentAngle}deg)`;

    // Determine which cube is facing front
    let normalized = ((-currentAngle % 360) + 360) % 360; 
    let activeIndex = Math.round(normalized / theta) % totalCubes;

    cubes.forEach((cube, i) => {
      if (i === activeIndex) {
        if (!cube.classList.contains('active')) cube.classList.add('active');
        cube.style.transform = `rotateY(${i * theta}deg) translateZ(${radius + 40}px) scale(1.05)`;
      } else {
        if (cube.classList.contains('active')) cube.classList.remove('active');
        cube.style.transform = `rotateY(${i * theta}deg) translateZ(${radius}px) scale(1)`;
      }
    });

    animationFrameId = requestAnimationFrame(animationLoop);
  }

  // Drag Interactions
  const onDragStart = (x) => {
    isDragging = true;
    startX = x;
    startAngle = targetAngle;
    carousel.style.cursor = 'grabbing';
    interactDelay = 120; // ~2 seconds pause
  };

  const onDragMove = (x) => {
    if (!isDragging) return;
    const deltaX = x - startX;
    targetAngle = startAngle + (deltaX * 0.5);
    interactDelay = 120;
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.style.cursor = 'grab';
    
    // Snap to nearest face
    const snapAngle = Math.round(targetAngle / theta) * theta;
    targetAngle = snapAngle;
    interactDelay = 120;
  };

  carousel.addEventListener('mousedown', (e) => onDragStart(e.clientX));
  window.addEventListener('mousemove', (e) => onDragMove(e.clientX));
  window.addEventListener('mouseup', onDragEnd);

  carousel.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientX), {passive: true});
  window.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientX), {passive: true});
  window.addEventListener('touchend', onDragEnd);

  // Scroll Interaction
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < window.innerHeight) {
       isScrolling = true;
       const delta = currentScrollY - lastScrollY;
       targetAngle -= delta * 0.15;
       interactDelay = 120;
    }
    lastScrollY = currentScrollY;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        if(!isDragging) {
            targetAngle = Math.round(targetAngle / theta) * theta;
            interactDelay = 120;
        }
    }, 400);
  }, {passive: true});

  setupCubes();
})();

/* ─────────────────────────────────────────────────────────────── */
/*  DIGITAL MARKETING EXPLORER INTERACTION                         */
/* ─────────────────────────────────────────────────────────────── */
(function initExplorer() {
  const explorer = document.getElementById('dmExplorer');
  if (!explorer) return;

  const cardsHtml = explorer.innerHTML;
  explorer.innerHTML = `<div class="dm-explorer-track">
    <div class="dm-explorer-group">${cardsHtml}</div>
    <div class="dm-explorer-group" aria-hidden="true">${cardsHtml}</div>
  </div>`;
})();

console.log('%c MIDCAV . %c Premium Digital & Creative Agency', 'background:#8952ff;color:#fff;padding:4px 8px;font-weight:bold;border-radius:4px;', 'color:#8952ff;');

