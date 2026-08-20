/* ═══════════════════════════════════════════════════════════════
   MIDCAV DIGITAL TECHNOLOGIES — Main Script v2.0
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────── */
/*  CUSTOM CURSOR                                                  */
/* ─────────────────────────────────────────────────────────────── */
(function initCursor() {
  const cursor  = document.getElementById('custom-cursor');
  const dot     = cursor?.querySelector('.cursor-dot');
  const ring    = cursor?.querySelector('.cursor-ring');
  if (!cursor || !dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  let raf;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    raf = requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
})();

/* ─────────────────────────────────────────────────────────────── */
/*  NAVIGATION                                                     */
/* ─────────────────────────────────────────────────────────────── */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('nav-mobile');

  // Scroll-based styling
  function onScroll() {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav?.classList.remove('open');
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  SCROLL REVEAL (IntersectionObserver)                          */
/* ─────────────────────────────────────────────────────────────── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || el.dataset.index || 0, 10) * (el.classList.contains('reveal-card') ? 80 : 1);
        const ms    = el.classList.contains('reveal-card') ? delay : parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => el.classList.add('visible'), ms);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────────────────────── */
/*  HERO CANVAS — Particle field                                   */
/* ─────────────────────────────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.vx = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      const colors = ['59,158,255', '200,169,110', '0,229,195', '199,125,255', '245,185,66'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 120 }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  init();
  draw();

  // Hero bg parallax on load
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const img = new Image();
    img.onload = () => heroBg.classList.add('loaded');
    img.src = 'hero_bg_new.jpg';
  }
})();

/* ─────────────────────────────────────────────────────────────── */
/*  HERO MOUSE PARALLAX                                            */
/* ─────────────────────────────────────────────────────────────── */
(function initHeroParallax() {
  const hero    = document.getElementById('hero');
  const content = document.getElementById('hero-content');
  const heroBg  = document.querySelector('.hero-bg');
  if (!hero || !content) return;

  let cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const dx   = (e.clientX - rect.left) / rect.width  - 0.5;
    const dy   = (e.clientY - rect.top)  / rect.height - 0.5;
    cx += (dx - cx) * 0.05;
    cy += (dy - cy) * 0.05;
    content.style.transform = `translate(${cx * -18}px, ${cy * -12}px)`;
    if (heroBg) heroBg.style.transform = `scale(1.05) translate(${cx * 10}px, ${cy * 8}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    cx = 0; cy = 0;
    content.style.transform = 'translate(0,0)';
    if (heroBg) heroBg.style.transform = 'scale(1)';
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  COUNTER ANIMATION                                              */
/* ─────────────────────────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────────────────────── */
/*  WAVEFORM CANVAS (Audio Studio)                                 */
/* ─────────────────────────────────────────────────────────────── */
(function initWaveform() {
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let frame = 0;

  function draw() {
    const W = canvas.width  = canvas.offsetWidth  || 320;
    const H = canvas.height = canvas.offsetHeight || 60;
    ctx.clearRect(0, 0, W, H);

    const bars = 60;
    const barW = W / bars;

    for (let i = 0; i < bars; i++) {
      const t  = frame * 0.04 + i * 0.35;
      const h  = (Math.sin(t) * 0.4 + Math.sin(t * 1.7 + 1) * 0.3 + Math.sin(t * 0.5) * 0.3) * 0.5 + 0.5;
      const bh = h * (H * 0.8);
      const x  = i * barW + barW * 0.1;
      const bw = barW * 0.7;

      const gradient = ctx.createLinearGradient(0, (H - bh) / 2, 0, (H + bh) / 2);
      gradient.addColorStop(0,   'rgba(255,106,180,0.9)');
      gradient.addColorStop(0.5, 'rgba(199,125,255,0.7)');
      gradient.addColorStop(1,   'rgba(255,106,180,0.9)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, (H - bh) / 2, bw, bh, 2);
      ctx.fill();
    }
    frame++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─────────────────────────────────────────────────────────────── */
/*  ECOSYSTEM CANVAS — Particle network background                 */
/* ─────────────────────────────────────────────────────────────── */
(function initEcoCanvas() {
  const canvas = document.getElementById('eco-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], animId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Node {
    constructor() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.5;
      const colors = ['59,158,255', '200,169,110', '0,229,195', '199,125,255', '245,185,66', '255,106,180'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},0.6)`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    nodes = Array.from({ length: 80 }, () => new Node());
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${nodes[i].color},${(1 - dist / 120) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    nodes.forEach(n => { n.update(); n.draw(); });
    animId = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(init);
  ro.observe(canvas);
  init();
  draw();
})();

/* ─────────────────────────────────────────────────────────────── */
/*  HORIZONTAL SCROLL — Projects Section                          */
/* ─────────────────────────────────────────────────────────────── */
(function initHorizontalScroll() {
  const wrap  = document.getElementById('work-scroll-wrap');
  const track = document.getElementById('work-scroll-track');
  if (!wrap || !track) return;

  let isDown = false, startX, scrollLeft;

  wrap.addEventListener('mousedown', e => {
    isDown = true;
    wrap.classList.add('dragging');
    startX     = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
  });
  wrap.addEventListener('mouseleave', () => { isDown = false; wrap.classList.remove('dragging'); });
  wrap.addEventListener('mouseup',    () => { isDown = false; wrap.classList.remove('dragging'); });
  wrap.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - wrap.offsetLeft;
    const walk = (x - startX) * 1.5;
    wrap.scrollLeft = scrollLeft - walk;
  });

  // Touch events
  let touchStartX, touchScrollLeft;
  wrap.addEventListener('touchstart', e => {
    touchStartX    = e.touches[0].pageX;
    touchScrollLeft = wrap.scrollLeft;
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    const x    = e.touches[0].pageX;
    const walk = touchStartX - x;
    wrap.scrollLeft = touchScrollLeft + walk;
  }, { passive: true });

  // Mouse-wheel horizontal scroll
  wrap.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    wrap.scrollLeft += e.deltaY;
  }, { passive: false });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  PROJECT FILTERS                                                */
/* ─────────────────────────────────────────────────────────────── */
(function initFilters() {
  const buttons = document.querySelectorAll('.work-filter');
  const cards   = document.querySelectorAll('.work-card');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.opacity   = match ? '1' : '0.25';
        card.style.transform = match ? '' : 'scale(0.95)';
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        card.style.pointerEvents = match ? '' : 'none';
      });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  MAGNETIC BUTTONS                                               */
/* ─────────────────────────────────────────────────────────────── */
(function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic-btn');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
    });
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.15s ease';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  CONTACT FORM                                                   */
/* ─────────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;
    }

    setTimeout(() => {
      form.reset();
      if (success) { success.style.display = 'block'; }
      if (btn) {
        btn.innerHTML = `<span>Start a Project</span><svg class="btn-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10h14M13 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        btn.disabled = false;
      }
      setTimeout(() => { if (success) success.style.display = 'none'; }, 5000);
    }, 1200);
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  ENGINE SECTION — Node hover interactions                       */
/* ─────────────────────────────────────────────────────────────── */
(function initEngineNodes() {
  const nodes = document.querySelectorAll('.engine-node');
  const lines = document.querySelectorAll('.eng-line');
  if (!nodes.length) return;

  const lineMap = { M:'el-m', I:'el-i', D:'el-d', C:'el-c', A:'el-a', V:'el-v' };

  nodes.forEach(node => {
    const dim = node.dataset.dim;
    node.addEventListener('mouseenter', () => {
      // Dim all lines, brighten active
      lines.forEach(l => l.style.strokeOpacity = '0.05');
      const target = document.querySelector('.' + lineMap[dim]);
      if (target) {
        target.style.strokeOpacity = '0.9';
        target.style.strokeWidth   = '2';
      }
    });
    node.addEventListener('mouseleave', () => {
      lines.forEach(l => {
        l.style.strokeOpacity = '0.3';
        l.style.strokeWidth   = '1';
      });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  PILLAR BAR ANIMATIONS (re-used from edge section concept)      */
/*  Applied to ecosystem flow nodes on scroll                      */
/* ─────────────────────────────────────────────────────────────── */
(function initEcoNodePulse() {
  const ecoNodes = document.querySelectorAll('.eco-node');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.boxShadow = '0 0 30px rgba(from var(--clr, 200,169,110) r g b / 0.15)';
      }
    });
  }, { threshold: 0.5 });
  ecoNodes.forEach(n => observer.observe(n));
})();

/* ─────────────────────────────────────────────────────────────── */
/*  SCROLL PROGRESS LINE                                           */
/* ─────────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  Object.assign(bar.style, {
    position: 'fixed', top: '0', left: '0', height: '2px', width: '0%',
    background: 'linear-gradient(to right, var(--clr-gold), var(--clr-i), var(--clr-d))',
    zIndex: '9999', transition: 'width 0.1s linear', pointerEvents: 'none'
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = progress + '%';
  }, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  SMOOTH SECTION TRANSITIONS (scale-up on enter viewport)        */
/* ─────────────────────────────────────────────────────────────── */
(function initSectionParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sections = document.querySelectorAll(
    '.tech-section, .marketing-section, .brand-section, .content-section, .about-section'
  );

  function onScroll() {
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const vh   = window.innerHeight;
      if (rect.top > vh || rect.bottom < 0) return;
      const progress = 1 - (rect.top / vh);
      const scale    = 0.97 + Math.min(progress * 0.03, 0.03);
      sec.style.transform = `scale(${scale})`;
      sec.style.transformOrigin = 'center center';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  ANCHOR SMOOTH SCROLL (native + JS fallback)                    */
/* ─────────────────────────────────────────────────────────────── */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  MARKETING SERVICE ITEMS — hover glow                           */
/* ─────────────────────────────────────────────────────────────── */
(function initServiceHovers() {
  const items = document.querySelectorAll('.mservice-item');
  const colors = ['var(--clr-i)', 'var(--clr-m)', 'var(--clr-d)', 'var(--clr-c)', 'var(--clr-a)', 'var(--clr-v)', 'var(--clr-gold)', 'var(--clr-i)'];

  items.forEach((item, i) => {
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      width: '6px', height: '6px', borderRadius: '50%',
      background: colors[i % colors.length], flexShrink: '0',
      marginRight: '0', transition: 'transform 0.3s'
    });
    item.insertBefore(dot, item.querySelector('.ms-num'));

    item.addEventListener('mouseenter', () => {
      dot.style.transform = 'scale(1.5)';
      dot.style.boxShadow = `0 0 8px currentColor`;
    });
    item.addEventListener('mouseleave', () => {
      dot.style.transform = '';
      dot.style.boxShadow = '';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  TICKER SPEED CONTROL                                           */
/* ─────────────────────────────────────────────────────────────── */
(function initTicker() {
  const ticker = document.querySelector('.hero-ticker');
  const track  = document.querySelector('.ticker-track');
  if (!ticker || !track) return;

  // Duplicate content for seamless loop
  track.innerHTML += track.innerHTML;

  ticker.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  ticker.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();

/* ─────────────────────────────────────────────────────────────── */
/*  TECH CARD ICON COLOR CYCLE                                     */
/* ─────────────────────────────────────────────────────────────── */
(function initTechCardColors() {
  const colors = ['var(--clr-i)', 'var(--clr-d)', 'var(--clr-m)', 'var(--clr-a)', 'var(--clr-v)', 'var(--clr-c)', 'var(--clr-gold)', 'var(--clr-i)'];
  document.querySelectorAll('.tech-card').forEach((card, i) => {
    const icon = card.querySelector('.tc-icon');
    if (icon) icon.style.color = colors[i % colors.length];
    card.addEventListener('mouseenter', () => {
      if (icon) icon.style.borderColor = colors[i % colors.length];
    });
    card.addEventListener('mouseleave', () => {
      if (icon) icon.style.borderColor = '';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  ENGINE SVG LINE GLOW on hover (complementary logic)            */
/* ─────────────────────────────────────────────────────────────── */
(function initSVGLineGlow() {
  // The SVG lines use CSS animation (dash-flow); add a shimmer filter on diagram hover
  const diagram = document.querySelector('.engine-diagram');
  if (!diagram) return;

  const svg = diagram.querySelector('.engine-svg');
  if (!svg) return;

  diagram.addEventListener('mouseenter', () => {
    svg.querySelectorAll('.eng-line').forEach(l => {
      l.style.transition    = 'stroke-opacity 0.3s, stroke-width 0.3s';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  PAGE LOAD ANIMATION                                            */
/* ─────────────────────────────────────────────────────────────── */
(function initPageLoad() {
  // Add a subtle entrance for the hero content
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  heroContent.style.opacity    = '0';
  heroContent.style.transform  = 'translateY(30px)';
  heroContent.style.transition = 'opacity 1.2s ease, transform 1.2s ease';

  window.addEventListener('load', () => {
    setTimeout(() => {
      heroContent.style.opacity   = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 100);
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  BRAND SECTION — stagger service list items                     */
/* ─────────────────────────────────────────────────────────────── */
(function initBrandList() {
  const items = document.querySelectorAll('.bsl-item');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity   = '1';
            item.style.transform = 'translateX(0)';
          }, i * 60);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  items.forEach(item => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-10px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const container = document.querySelector('.brand-services-list');
  if (container) observer.observe(container);
})();

/* ─────────────────────────────────────────────────────────────── */
/*  CASE STUDY STEP ANIMATION                                      */
/* ─────────────────────────────────────────────────────────────── */
(function initCaseStudy() {
  const steps = document.querySelectorAll('.cs-step');
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      steps.forEach((step, i) => {
        setTimeout(() => {
          step.style.opacity   = '1';
          step.style.transform = 'translateY(0)';
        }, i * 120);
      });
      observer.disconnect();
    }
  }, { threshold: 0.2 });

  steps.forEach(step => {
    step.style.opacity   = '0';
    step.style.transform = 'translateY(20px)';
    step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const csFlow = document.querySelector('.cs-flow');
  if (csFlow) observer.observe(csFlow);
})();

/* ─────────────────────────────────────────────────────────────── */
/*  FOOTER — pill hover rainbow effect                             */
/* ─────────────────────────────────────────────────────────────── */
(function initFooterPills() {
  const pills  = document.querySelectorAll('.footer-pill');
  const colors = ['var(--clr-m)', 'var(--clr-i)', 'var(--clr-d)', 'var(--clr-c)', 'var(--clr-a)', 'var(--clr-v)'];
  pills.forEach((pill, i) => {
    pill.addEventListener('mouseenter', () => {
      pill.style.borderColor = colors[i];
      pill.style.color       = colors[i];
      pill.style.boxShadow   = `0 0 12px rgba(from ${colors[i]} r g b / 0.3)`;
    });
    pill.addEventListener('mouseleave', () => {
      pill.style.borderColor = '';
      pill.style.color       = '';
      pill.style.boxShadow   = '';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────── */
/*  CONSOLE SIGNATURE                                              */
/* ─────────────────────────────────────────────────────────────── */
console.log(
  '%c MIDCAV . %c Creative Technology. Digital Media. Built Differently.',
  'background:#c8a96e;color:#030508;font-weight:bold;font-size:14px;padding:4px 12px;',
  'color:#3b9eff;font-size:12px;padding:4px;'
);

/* ─────────────────────────────────────────────────────────────── */
/*  THEME TOGGLE (LIGHT / DARK MODE)                               */
/* ─────────────────────────────────────────────────────────────── */
(function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle');
  if (!toggleBtns.length) return;

  const html = document.documentElement;
  const storageKey = 'midcav-theme';

  // Determine initial theme
  const savedTheme = localStorage.getItem(storageKey);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = 'dark'; // Default
  
  if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
    currentTheme = 'light';
  }

  // Apply initial theme immediately (no transition)
  if (currentTheme === 'light') {
    html.setAttribute('data-theme', 'light');
  }

  function updateIconsCorrectly(theme) {
    toggleBtns.forEach(btn => {
      const sun = btn.querySelector('.icon-sun');
      const moon = btn.querySelector('.icon-moon');
      if (theme === 'light') {
        if (sun) sun.style.display = 'none';
        if (moon) moon.style.display = 'block';
      } else {
        if (sun) sun.style.display = 'block';
        if (moon) moon.style.display = 'none';
      }
    });
  }
  
  updateIconsCorrectly(currentTheme);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Add transition class for smooth fade
      html.classList.add('theme-transition-active');
      
      if (currentTheme === 'light') {
        html.setAttribute('data-theme', 'light');
      } else {
        html.removeAttribute('data-theme');
      }
      
      localStorage.setItem(storageKey, currentTheme);
      updateIconsCorrectly(currentTheme);
      
      // Remove transition class after animation completes (400ms)
      setTimeout(() => {
        html.classList.remove('theme-transition-active');
      }, 500);
    });
  });
})();
