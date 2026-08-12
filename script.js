/* ═══════════════════════════════════════════════════════════════
   MIDCAV DIGITAL TECHNOLOGIES — Interactive JavaScript
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── UTILITY: requestAnimationFrame loop ─── */
const raf = fn => requestAnimationFrame(fn);

/* ─── CUSTOM CURSOR ─── */
(function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  let lastTime = 0;
  function animateCursor(t) {
    if (t - lastTime > 8) {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      lastTime = t;
    }
    raf(animateCursor);
  }
  raf(animateCursor);

  document.querySelectorAll('a, button, .dim-card, .journey-letter').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.transform = 'translate(-50%,-50%) scale(2.5)'; ring.style.width = '56px'; ring.style.height = '56px'; });
    el.addEventListener('mouseleave', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.width = '38px'; ring.style.height = '38px'; });
  });
})();

/* ─── NAVIGATION: scroll behaviour & hamburger ─── */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger-btn');
  const navMobile = document.getElementById('nav-mobile');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMobile.classList.toggle('open');
  });

  navMobile.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
    });
  });
})();

/* ─── SCROLL REVEAL: IntersectionObserver ─── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        const idx = parseInt(el.dataset.index || 0);
        setTimeout(() => el.classList.add('visible'), delay + idx * 120);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* Pillar fill bars */
  const pillars = document.querySelectorAll('.edge-pillar');
  const pillarObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        pillarObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  pillars.forEach(el => pillarObs.observe(el));
})();

/* ═══════════════════════════════════════════════════════════════
   HERO CANVAS — Particle Network with Connections
   ═══════════════════════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;
  const PARTICLE_COUNT = 120;
  const MAX_DIST = 140;

  const colors = ['rgba(200,169,110,', 'rgba(59,158,255,', 'rgba(0,229,195,', 'rgba(199,125,255,'];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -20;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.1;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.pulse += this.pulseSpeed;
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      const a = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + a + ')';
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const a = (1 - d / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200,169,110,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* Central glow burst */
  function drawCentralGlow(t) {
    const cx = W / 2, cy = H * 0.42;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.0008);
    const r1 = 180 + pulse * 40;
    const r2 = 400 + pulse * 80;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r2);
    grd.addColorStop(0, `rgba(200,169,110,${0.04 + pulse * 0.03})`);
    grd.addColorStop(0.4, `rgba(59,158,255,${0.025 + pulse * 0.015})`);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r2, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Horizontal scan line */
  let scanY = 0;
  function drawScanLine(t) {
    scanY = (t * 0.03) % H;
    const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 2);
    grad.addColorStop(0, 'rgba(200,169,110,0)');
    grad.addColorStop(1, 'rgba(200,169,110,0.04)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 60, W, 62);
  }

  function loop(t) {
    ctx.clearRect(0, 0, W, H);
    drawCentralGlow(t);
    drawConnections();
    drawScanLine(t);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = raf(loop);
  }

  const resizeObs = new ResizeObserver(() => { resize(); });
  resizeObs.observe(canvas.parentElement);
  init();
  raf(loop);
})();

/* ═══════════════════════════════════════════════════════════════
   DIMENSION CANVASES
   ═══════════════════════════════════════════════════════════════ */
(function initDimensionCanvases() {
  const canvases = document.querySelectorAll('.dim-canvas');

  canvases.forEach(canvas => {
    const type = canvas.dataset.type;
    const ctx = canvas.getContext('2d');
    let W, H, animId, t = 0;

    function resize() {
      W = canvas.width = canvas.offsetWidth || 400;
      H = canvas.height = canvas.offsetHeight || 300;
    }

    /* ── METHOD: Neural network / constellation ── */
    function drawMethod() {
      ctx.clearRect(0, 0, W, H);
      const nodes = 18;
      const pts = [];
      for (let i = 0; i < nodes; i++) {
        const angle = (i / nodes) * Math.PI * 2;
        const jitter = Math.sin(t * 0.01 + i * 0.8) * 20;
        const r = Math.min(W, H) * 0.3 + jitter;
        pts.push({
          x: W / 2 + Math.cos(angle) * r * (0.6 + 0.4 * Math.sin(i)),
          y: H / 2 + Math.sin(angle) * r * (0.6 + 0.4 * Math.cos(i * 0.7))
        });
      }
      // Connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < Math.min(W, H) * 0.45) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(245,185,66,${0.12 * (1 - d/(Math.min(W,H)*0.45))})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // Nodes
      pts.forEach((p, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.02 + i * 0.5);
        const r = 2.5 + pulse * 2;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        grd.addColorStop(0, `rgba(245,185,66,${0.7 * pulse})`);
        grd.addColorStop(1, 'rgba(245,185,66,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,185,66,${0.8 * pulse})`;
        ctx.fill();
      });
      // Central pulse
      const cp = { x: W/2, y: H/2 };
      const cpPulse = 0.5 + 0.5 * Math.sin(t * 0.015);
      const cpGrd = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, 60);
      cpGrd.addColorStop(0, `rgba(245,185,66,${0.3 * cpPulse})`);
      cpGrd.addColorStop(1, 'rgba(245,185,66,0)');
      ctx.fillStyle = cpGrd;
      ctx.beginPath(); ctx.arc(cp.x, cp.y, 60, 0, Math.PI*2); ctx.fill();
    }

    /* ── IMAGE: Prismatic light refraction ── */
    const imgParticles = [];
    function initImageParticles() {
      imgParticles.length = 0;
      for (let i = 0; i < 50; i++) {
        imgParticles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8,
          r: Math.random() * 3 + 1,
          hue: Math.random() * 60 + 180,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    }
    function drawImage() {
      ctx.clearRect(0, 0, W, H);
      // Dark bg gradient
      const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.8);
      bg.addColorStop(0, 'rgba(20,30,50,0.5)');
      bg.addColorStop(1, 'rgba(5,8,15,0.9)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Prism rays
      const cx = W * 0.6, cy = H * 0.35;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI + Math.sin(t * 0.008) * 0.3;
        const len = Math.min(W, H) * 0.7;
        const hue = i * 30 + t * 0.05;
        const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle)*len, cy + Math.sin(angle)*len);
        grad.addColorStop(0, `hsla(${hue},90%,70%,0.6)`);
        grad.addColorStop(1, `hsla(${hue},90%,70%,0)`);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle-0.04)*len, cy + Math.sin(angle-0.04)*len);
        ctx.lineTo(cx + Math.cos(angle+0.04)*len, cy + Math.sin(angle+0.04)*len);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }
      // Lens flare core
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.02);
      const lensGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + pulse * 20);
      lensGrd.addColorStop(0, `rgba(255,255,255,${0.9 * pulse})`);
      lensGrd.addColorStop(0.3, `rgba(200,169,110,${0.5 * pulse})`);
      lensGrd.addColorStop(1, 'rgba(59,158,255,0)');
      ctx.fillStyle = lensGrd;
      ctx.beginPath(); ctx.arc(cx, cy, 30+pulse*20, 0, Math.PI*2); ctx.fill();

      // Floating particles
      imgParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${p.hue},80%,70%,${p.alpha})`;
        ctx.fill();
      });
    }

    /* ── DESIGN: Holographic grid / interface wireframes ── */
    function drawDesign() {
      ctx.clearRect(0, 0, W, H);
      // Grid
      const gridSpacing = 30;
      const gridAlpha = 0.06 + 0.04 * Math.sin(t * 0.01);
      ctx.strokeStyle = `rgba(0,229,195,${gridAlpha})`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // Floating UI elements
      const elems = [
        { x: W*0.2, y: H*0.25, w: W*0.25, h: H*0.12, phase: 0 },
        { x: W*0.55, y: H*0.2, w: W*0.3, h: H*0.08, phase: 1 },
        { x: W*0.15, y: H*0.55, w: W*0.35, h: H*0.25, phase: 2 },
        { x: W*0.55, y: H*0.45, w: W*0.3, h: H*0.15, phase: 3 },
        { x: W*0.55, y: H*0.65, w: W*0.18, h: H*0.14, phase: 4 },
      ];
      elems.forEach(el => {
        const float = Math.sin(t * 0.012 + el.phase * 1.2) * 5;
        const alpha = 0.4 + 0.3 * Math.sin(t * 0.015 + el.phase);
        const x = el.x, y = el.y + float;
        // Frame
        ctx.strokeStyle = `rgba(0,229,195,${alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, el.w, el.h);
        // Corner accents
        const ca = 8;
        ctx.strokeStyle = `rgba(0,229,195,${alpha * 1.5})`;
        ctx.lineWidth = 1.5;
        [[x,y],[x+el.w,y],[x,y+el.h],[x+el.w,y+el.h]].forEach(([cx,cy], i) => {
          ctx.beginPath();
          ctx.moveTo(cx + (i%2===0?ca:-ca), cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + (i<2?ca:-ca));
          ctx.stroke();
        });
        // Inner line
        ctx.strokeStyle = `rgba(0,229,195,${alpha * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x+4, y+4, el.w-8, el.h-8);
      });
      // Crosshair
      const chx = W*0.5, chy = H*0.5;
      const chPulse = 0.5 + 0.5*Math.sin(t*0.02);
      ctx.strokeStyle = `rgba(0,229,195,${0.5*chPulse})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(chx-25, chy); ctx.lineTo(chx+25, chy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(chx, chy-25); ctx.lineTo(chx, chy+25); ctx.stroke();
    }

    /* ── CONTENT: Flowing text particles / editorial ── */
    const contentLines = [];
    function initContentLines() {
      contentLines.length = 0;
      const chars = 'NARRATIVE STORY WORDS BRAND IDEA VOICE CONTENT CHARACTER PURPOSE';
      for (let i = 0; i < 20; i++) {
        const word = chars.split(' ')[Math.floor(Math.random() * 9)];
        contentLines.push({
          text: word,
          x: Math.random() * W,
          y: Math.random() * H,
          vy: (Math.random() - 0.5) * 0.3,
          vx: (Math.random() - 0.5) * 0.15,
          alpha: Math.random() * 0.15 + 0.03,
          size: Math.random() * 10 + 8,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    function drawContent() {
      ctx.clearRect(0, 0, W, H);
      // Glowing threads
      for (let i = 0; i < 6; i++) {
        const progress = ((t * 0.004 + i * 0.18) % 1);
        const x1 = W * 0.1, x2 = W * 0.9;
        const y = H * (0.15 + i * 0.13);
        const threadAlpha = Math.sin(progress * Math.PI) * 0.25;
        const curveY = y + Math.sin(t * 0.008 + i * 0.7) * 20;
        ctx.beginPath();
        ctx.moveTo(x1, curveY);
        ctx.bezierCurveTo(W*0.35, curveY - 30, W*0.65, curveY + 30, x2, curveY);
        ctx.strokeStyle = `rgba(199,125,255,${threadAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Moving dot
        const dotX = x1 + progress * (x2 - x1);
        const dotGrd = ctx.createRadialGradient(dotX, curveY, 0, dotX, curveY, 8);
        dotGrd.addColorStop(0, `rgba(199,125,255,0.9)`);
        dotGrd.addColorStop(1, 'rgba(199,125,255,0)');
        ctx.fillStyle = dotGrd;
        ctx.beginPath(); ctx.arc(dotX, curveY, 8, 0, Math.PI*2); ctx.fill();
      }
      // Text particles
      contentLines.forEach(line => {
        line.x += line.vx; line.y += line.vy;
        if (line.x < -50) line.x = W+50; if (line.x > W+50) line.x = -50;
        if (line.y < -20) line.y = H+20; if (line.y > H+20) line.y = -20;
        const a = line.alpha * (0.5 + 0.5 * Math.sin(t * 0.01 + line.phase));
        ctx.font = `${line.size}px 'Space Mono', monospace`;
        ctx.fillStyle = `rgba(199,125,255,${a})`;
        ctx.letterSpacing = '0.1em';
        ctx.fillText(line.text, line.x, line.y);
      });
    }

    /* ── AUDIO: Waveform / frequency bars ── */
    function drawAudio() {
      ctx.clearRect(0, 0, W, H);
      const bars = 64;
      const barW = W / bars;
      const centerY = H / 2;

      // Multiple waveform layers
      for (let layer = 0; layer < 3; layer++) {
        const layerAlpha = [0.5, 0.25, 0.12][layer];
        const freq = [1, 2.3, 4.7][layer];
        const speed = [0.025, -0.018, 0.031][layer];
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        for (let x = 0; x <= W; x += 2) {
          const i = x / W;
          const y = centerY + Math.sin(i * Math.PI * freq * 4 + t * speed * 50) *
                    Math.sin(i * Math.PI) * (H * 0.25) *
                    (0.5 + 0.5 * Math.sin(t * 0.01 + layer));
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,106,180,${layerAlpha})`;
        ctx.lineWidth = 2 - layer * 0.5;
        ctx.stroke();
      }

      // Frequency bars
      for (let i = 0; i < bars; i++) {
        const phase = (i / bars) * Math.PI * 2;
        const h = (Math.abs(Math.sin(phase + t * 0.035)) * 0.5 + Math.abs(Math.sin(phase * 2.3 + t * 0.025)) * 0.3 + 0.1) * H * 0.4;
        const x = i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const alpha = 0.25 + 0.35 * (h / (H * 0.4));
        const grd = ctx.createLinearGradient(x, centerY, x, centerY - h);
        grd.addColorStop(0, `rgba(255,106,180,0)`);
        grd.addColorStop(0.6, `rgba(255,106,180,${alpha})`);
        grd.addColorStop(1, `rgba(200,100,255,${alpha * 1.5})`);
        ctx.fillStyle = grd;
        ctx.fillRect(x, centerY - h/2, bw, h/2);
        const grd2 = ctx.createLinearGradient(x, centerY, x, centerY + h);
        grd2.addColorStop(0, `rgba(255,106,180,0)`);
        grd2.addColorStop(1, `rgba(255,106,180,${alpha * 0.3})`);
        ctx.fillStyle = grd2;
        ctx.fillRect(x, centerY, bw, h/2);
      }

      // Circular ring
      const ringPulse = 0.5 + 0.5 * Math.sin(t * 0.025);
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(W/2, H/2, (40 + r*20) * ringPulse, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(255,106,180,${0.15 / r})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    /* ── VIDEO: Cinematic light leaks / film ── */
    function drawVideo() {
      ctx.clearRect(0, 0, W, H);
      // Deep cinematic bg
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, 'rgba(8,5,3,0.95)');
      bg.addColorStop(1, 'rgba(3,3,8,0.95)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Anamorphic lens flare streaks
      const flareY = H * 0.42 + Math.sin(t * 0.006) * 15;
      for (let i = 0; i < 5; i++) {
        const offset = (i - 2) * H * 0.025;
        const len = W * (0.6 + Math.sin(t*0.008+i)*0.15);
        const cx = W * 0.5;
        const alpha = [0.5,0.3,0.2,0.12,0.07][i];
        const grd = ctx.createLinearGradient(cx - len/2, flareY+offset, cx + len/2, flareY+offset);
        grd.addColorStop(0, 'rgba(255,200,100,0)');
        grd.addColorStop(0.35, `rgba(255,220,140,${alpha})`);
        grd.addColorStop(0.5, `rgba(255,255,200,${alpha*1.5})`);
        grd.addColorStop(0.65, `rgba(255,220,140,${alpha})`);
        grd.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(cx - len/2, flareY + offset - 1, len, [3,2,1.5,1,0.5][i]);
      }

      // Film grain
      const imageData = ctx.getImageData(0, 0, W, H);
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 40) {
        const noise = (Math.random() - 0.5) * 15;
        pixels[i] = Math.min(255, Math.max(0, pixels[i] + noise));
        pixels[i+1] = Math.min(255, Math.max(0, pixels[i+1] + noise));
        pixels[i+2] = Math.min(255, Math.max(0, pixels[i+2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      // Light leak top
      const leakGrd = ctx.createRadialGradient(W*0.8, H*0.1, 0, W*0.8, H*0.1, W*0.5);
      const leakPulse = 0.5 + 0.5 * Math.sin(t * 0.012);
      leakGrd.addColorStop(0, `rgba(255,120,40,${0.18 * leakPulse})`);
      leakGrd.addColorStop(0.5, `rgba(255,80,20,${0.06 * leakPulse})`);
      leakGrd.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = leakGrd;
      ctx.fillRect(0, 0, W, H);

      // Cinematic letterbox bars
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.fillRect(0, 0, W, H * 0.085);
      ctx.fillRect(0, H * 0.915, W, H * 0.085);

      // Film sprocket dots
      for (let i = 0; i < 6; i++) {
        const sx = (W/6) * i + W/12;
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath(); ctx.arc(sx, H*0.042, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx, H*0.958, 5, 0, Math.PI*2); ctx.fill();
      }

      // Motion blur trails
      for (let i = 0; i < 8; i++) {
        const trailX = W * (0.2 + i * 0.08);
        const trailProgress = ((t * 0.01 + i * 0.14) % 1);
        const trailY = H * 0.15 + trailProgress * H * 0.7;
        const trailAlpha = Math.sin(trailProgress * Math.PI) * 0.12;
        const trailGrd = ctx.createLinearGradient(trailX, trailY - 60, trailX, trailY);
        trailGrd.addColorStop(0, 'rgba(255,200,100,0)');
        trailGrd.addColorStop(1, `rgba(255,200,100,${trailAlpha})`);
        ctx.fillStyle = trailGrd;
        ctx.fillRect(trailX - 0.5, trailY - 60, 1, 60);
      }
    }

    const drawFns = { method: drawMethod, image: drawImage, design: drawDesign, content: drawContent, audio: drawAudio, video: drawVideo };

    function loop() {
      t++;
      if (drawFns[type]) drawFns[type]();
      animId = raf(loop);
    }

    const resizeObs = new ResizeObserver(() => {
      resize();
      if (type === 'image') initImageParticles();
      if (type === 'content') initContentLines();
    });

    resize();
    if (type === 'image') initImageParticles();
    if (type === 'content') initContentLines();
    resizeObs.observe(canvas.parentElement);
    raf(loop);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   EDGE SECTION BACKGROUND CANVAS
   ═══════════════════════════════════════════════════════════════ */
(function initEdgeCanvas() {
  const canvas = document.getElementById('edge-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Flowing diagonal lines
    for (let i = 0; i < 12; i++) {
      const progress = ((t * 0.002 + i * 0.09) % 1);
      const startX = -W * 0.2 + progress * W * 1.4;
      const alpha = Math.sin(progress * Math.PI) * 0.08;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + W * 0.3, H);
      ctx.strokeStyle = `rgba(200,169,110,${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Corner node pulses
    const corners = [
      { x: W*0.1, y: H*0.2 },
      { x: W*0.9, y: H*0.15 },
      { x: W*0.15, y: H*0.8 },
      { x: W*0.85, y: H*0.85 },
    ];
    corners.forEach((c, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(t*0.02 + i * 1.5);
      const grd = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 80);
      grd.addColorStop(0, `rgba(200,169,110,${0.08*pulse})`);
      grd.addColorStop(1, 'rgba(200,169,110,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(c.x, c.y, 80, 0, Math.PI*2); ctx.fill();
    });
    t++;
    raf(draw);
  }

  const resizeObs = new ResizeObserver(resize);
  resizeObs.observe(canvas.parentElement);
  resize();
  raf(draw);
})();

/* ═══════════════════════════════════════════════════════════════
   JOURNEY LETTERS — Active state on scroll-based highlight
   ═══════════════════════════════════════════════════════════════ */
(function initJourneyLetters() {
  const letters = document.querySelectorAll('.journey-letter');
  let activeIdx = 0;

  function cycleLetter() {
    letters.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
    activeIdx = (activeIdx + 1) % letters.length;
  }

  const cycleStyle = document.createElement('style');
  cycleStyle.textContent = `
    .journey-letter.active .jl-char {
      border-color: var(--clr-gold) !important;
      box-shadow: 0 0 30px rgba(200,169,110,0.35), 0 0 60px rgba(200,169,110,0.15) !important;
      background: rgba(200,169,110,0.12) !important;
    }
    .journey-letter.active .jl-label { color: var(--clr-gold) !important; }
  `;
  document.head.appendChild(cycleStyle);

  setInterval(cycleLetter, 1200);
})();

/* ═══════════════════════════════════════════════════════════════
   CONTACT FORM — Submission handler
   ═══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const btn = document.getElementById('form-submit-btn');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    if (!name || !email) {
      [document.getElementById('cf-name'), document.getElementById('cf-email')].forEach(el => {
        if (!el.value.trim()) { el.style.borderColor = '#ff4d4d'; setTimeout(() => el.style.borderColor = '', 2000); }
      });
      return;
    }
    btn.querySelector('span').textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.querySelector('span').textContent = 'Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #00e5c3, #00c8a8)';
      form.reset();
      setTimeout(() => {
        btn.querySelector('span').textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1500);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   ENGINE FLOW — Animated highlight sequence
   ═══════════════════════════════════════════════════════════════ */
(function initEngineFlow() {
  const items = document.querySelectorAll('.ef-item');
  if (!items.length) return;
  let idx = 0;

  function highlightNext() {
    items.forEach((item, i) => {
      item.style.transform = i === idx ? 'translateY(-6px) scale(1.08)' : '';
      item.style.boxShadow = i === idx ? '0 12px 32px rgba(200,169,110,0.25)' : '';
    });
    idx = (idx + 1) % items.length;
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setInterval(highlightNext, 900);
      obs.disconnect();
    }
  }, { threshold: 0.5 });

  const engineFlow = document.querySelector('.engine-flow');
  if (engineFlow) obs.observe(engineFlow);
})();

/* ═══════════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLLING
   ═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
   PARALLAX — Hero content subtle shift
   ═══════════════════════════════════════════════════════════════ */
(function initParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
      heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
    }
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════════
   DIM CARDS — 3D tilt on hover
   ═══════════════════════════════════════════════════════════════ */
(function initCardTilt() {
  document.querySelectorAll('.dim-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      card.style.transform = `perspective(800px) rotateX(${-dy * 6}deg) rotateY(${dx * 6}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════════
   HERO ENTER ANIMATION — Staggered text reveal
   ═══════════════════════════════════════════════════════════════ */
(function initHeroReveal() {
  const reveals = document.querySelectorAll('.hero .reveal-up');
  reveals.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay + 300);
  });
})();

console.log('%c MIDCAV DIGITAL TECHNOLOGIES ', 'background:#c8a96e;color:#030508;font-family:monospace;font-size:14px;font-weight:bold;padding:6px 12px;letter-spacing:0.2em;');
console.log('%c Creative Technology Studio — Ideas. Engineered Differently. ', 'color:#c8a96e;font-family:monospace;font-size:10px;letter-spacing:0.1em;');
