/* ═══════════════════════════════════════════════════════════════
   MIDCAV DIGITAL TECHNOLOGIES
   Cinematic Scroll Background Engine v3.0 — Performance Edition
   ─────────────────────────────────────────────────────────────
   FIX LOG (v2 → v3):
   • LERP factor raised 0.10 → 0.18  (scroll latency halved)
   • Parallax moved onto a separate inner <div> — never fights
     the crossfade CSS transition on the layer itself
   • filter removed from will-change list (was causing repaint
     blinking on every parallax frame)
   • pending lock timeout shortened: CROSSFADE_MS+150 → 560ms
     so fast scrolling doesn't freeze background for ~1 second
   • Dirty-flag: parallax only writes style when value changes
     by >0.3px (eliminates sub-pixel thrashing every rAF tick)
   • rAF loop self-suspends when scroll is settled (idle state)
     and resumes instantly on next scroll event
   • Preload uses <link rel="preload"> for first two images so
     the initial scene appears without FOUT / flash
   • Touch-device detection skips parallax (saves battery)
   ═══════════════════════════════════════════════════════════════ */

(function MIDCAVScrollBG() {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────────────────────────── */
  const CFG = {
    LERP:               0.18,   // scroll catch-up speed (higher = faster/snappier)
    LERP_SETTLE:        0.001,  // threshold below which scroll is considered "settled"
    CROSSFADE_MS:       820,    // crossfade transition duration (ms)
    BLUR_START:         14,     // blur (px) when image first appears
    SCALE_ACTIVE:       1.0,    // final scale of active image
    SCALE_ENTER:        1.07,   // scale when entering
    SCALE_EXIT:         0.97,   // scale when exiting
    PARALLAX_FACTOR:    0.18,   // vertical parallax depth
    PARALLAX_MIN_DELTA: 0.4,    // px — skip style write if delta < this
    PENDING_RELEASE:    560,    // ms before next scene is allowed (was 1050ms)
    USE_PARALLAX: !window.matchMedia('(pointer: coarse)').matches,
  };

  /* ─────────────────────────────────────────────────────────────
     IMAGE MANIFEST
  ───────────────────────────────────────────────────────────── */
  const SCENES = [
    { src: 'home_hero.jpg',      label: 'Creative Technology',          color: '#c8a96e' },
    { src: 'hero_monitor.jpg',   label: 'Digital Marketing',            color: '#3b9eff' },
    { src: 'workspace_vibe.jpg', label: 'Technology Solutions',         color: '#00e5c3' },
    { src: 'mockup1.jpg',        label: 'Graphic & UI/UX Design',       color: '#00e5c3' },
    { src: 'hero_photo.png',     label: 'Content Creation',             color: '#c77dff' },
    { src: 'midcav_core.jpg',    label: 'Brand Identity',               color: '#c8a96e' },
    { src: 'hero_camera.jpg',    label: 'Video & Motion',               color: '#ff4d4d' },
    { src: 'hero_wave.jpg',      label: 'Audio / Sonic Design',         color: '#ff6ab4' },
    { src: 'hero_vr_img.jpg',    label: 'Creative Digital Experiences', color: '#3b9eff' },
    { src: 'stats_bg.jpg',       label: 'The MIDCAV Engine',            color: '#c8a96e' },
  ];

  const N = SCENES.length;

  /* ─────────────────────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────────────────── */
  let layerA, layerB, layerAInner, layerBInner;
  let overlay, badge, labelEl, progressBar;

  let frontLayer   = 'A';
  let activeIdx    = -1;
  let pending      = false;
  let pendingTimer = null;

  let currentScrollY = 0;
  let targetScrollY  = 0;
  let rafHandle      = null;
  let idleState      = false;

  let lastParallaxShift = null;
  let lastProgressPct   = '';

  let pageH = 1, viewH = 1;

  /* ─────────────────────────────────────────────────────────────
     CSS INJECTION
  ───────────────────────────────────────────────────────────── */
  function injectCSS() {
    const css = `
      #mcv-stage {
        position: fixed;
        inset: 0;
        z-index: -10;
        overflow: hidden;
        background: #030508;
        pointer-events: none;
      }

      /*
       * .mcv-layer  → opacity + filter + scale  (CSS transition handles crossfade)
       * .mcv-layer-inner → translateY only      (rAF handles parallax each frame)
       *
       * Keeping these on separate elements prevents the crossfade transition
       * from conflicting with per-frame inline transform writes, eliminating
       * the blink / stutter / jank that occurred in v2.
       */
      .mcv-layer {
        position: absolute;
        inset: 0;
        opacity: 0;
        filter: blur(${CFG.BLUR_START}px) brightness(0.65);
        transform: scale(${CFG.SCALE_ENTER});
        /* will-change: NO filter here — filter on will-change triggers a
           separate raster layer that caused blinking on every parallax tick */
        will-change: opacity, transform;
        transition:
          opacity   ${CFG.CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
          filter    ${Math.round(CFG.CROSSFADE_MS * 1.1)}ms cubic-bezier(0.22, 1, 0.36, 1),
          transform ${Math.round(CFG.CROSSFADE_MS * 1.05)}ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .mcv-layer.mcv-active {
        opacity: 1;
        filter: blur(0px) brightness(0.72);
        transform: scale(${CFG.SCALE_ACTIVE});
      }
      .mcv-layer.mcv-exit {
        opacity: 0;
        filter: blur(6px) brightness(0.55);
        transform: scale(${CFG.SCALE_EXIT});
        transition:
          opacity   ${Math.round(CFG.CROSSFADE_MS * 0.8)}ms cubic-bezier(0.22, 1, 0.36, 1),
          filter    ${CFG.CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
          transform ${CFG.CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* Parallax inner — translateY only, no CSS transition, GPU composited */
      .mcv-layer-inner {
        position: absolute;
        top: -14%; left: -5%;
        width: 110%; height: 128%;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        will-change: transform;
      }

      #mcv-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(to bottom,
            rgba(3,5,8,0.85)  0%,
            rgba(3,5,8,0.20)  14%,
            rgba(3,5,8,0.08)  40%,
            rgba(3,5,8,0.18)  65%,
            rgba(3,5,8,0.55)  85%,
            rgba(3,5,8,0.90)  100%
          ),
          radial-gradient(ellipse 120% 120% at 50% 50%,
            transparent 35%,
            rgba(3,5,8,0.55) 100%
          );
      }

      #mcv-progress {
        position: fixed;
        top: 0; left: 0;
        height: 2px;
        width: 0%;
        background: linear-gradient(90deg,
          rgba(200,169,110,0) 0%,
          #c8a96e 20%,
          #e8c98a 50%,
          #c8a96e 80%,
          rgba(200,169,110,0) 100%
        );
        background-size: 200% 100%;
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 0 10px rgba(200,169,110,0.5), 0 0 20px rgba(200,169,110,0.2);
        animation: mcv-progress-shimmer 2s linear infinite;
        will-change: width;
      }
      @keyframes mcv-progress-shimmer {
        0%   { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }

      #mcv-badge {
        position: fixed;
        bottom: 2.8rem;
        right: 2.8rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        z-index: 999;
        pointer-events: none;
        opacity: 0;
        transform: translateY(8px) translateX(6px);
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      #mcv-badge.mcv-badge-show {
        opacity: 1;
        transform: translateY(0) translateX(0);
      }
      .mcv-badge-line {
        width: 28px; height: 1px;
        background: currentColor; opacity: 0.5;
      }
      .mcv-badge-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: currentColor;
        animation: mcv-badge-pulse 2s ease-in-out infinite;
        flex-shrink: 0;
      }
      @keyframes mcv-badge-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.3; transform: scale(0.55); }
      }
      .mcv-badge-text {
        font-family: 'Space Mono', monospace;
        font-size: 0.58rem; letter-spacing: 0.24em;
        text-transform: uppercase; color: currentColor; white-space: nowrap;
      }

      #mcv-dots {
        position: fixed;
        right: 2rem; top: 50%;
        transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 0.5rem;
        z-index: 998; pointer-events: none;
        opacity: 0; transition: opacity 0.5s ease;
      }
      #mcv-dots.mcv-dots-show { opacity: 1; }
      .mcv-dot {
        width: 4px; height: 4px; border-radius: 50%;
        background: rgba(255,255,255,0.25);
        transition: background 0.4s ease, transform 0.4s ease;
        flex-shrink: 0;
      }
      .mcv-dot.mcv-dot-active { background: #c8a96e; transform: scale(1.8); }

      @media (max-width: 768px) {
        #mcv-badge { bottom: 1.5rem; right: 1.5rem; font-size: 0.5rem; }
        #mcv-dots  { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        .mcv-layer {
          transition: opacity 300ms ease !important;
          filter: brightness(0.72) !important;
          transform: none !important;
        }
        .mcv-layer.mcv-active { filter: brightness(0.72) !important; transform: none !important; }
        .mcv-layer.mcv-exit   { transform: none !important; }
        .mcv-layer-inner      { will-change: auto !important; }
      }
    `;
    const el = document.createElement('style');
    el.id = 'mcv-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ─────────────────────────────────────────────────────────────
     DOM
  ───────────────────────────────────────────────────────────── */
  function buildDOM() {
    const stage = document.createElement('div');
    stage.id = 'mcv-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.setAttribute('role', 'presentation');

    layerA = document.createElement('div');
    layerA.className = 'mcv-layer';
    layerA.id = 'mcv-layer-a';
    layerAInner = document.createElement('div');
    layerAInner.className = 'mcv-layer-inner';
    layerA.appendChild(layerAInner);

    layerB = document.createElement('div');
    layerB.className = 'mcv-layer';
    layerB.id = 'mcv-layer-b';
    layerBInner = document.createElement('div');
    layerBInner.className = 'mcv-layer-inner';
    layerB.appendChild(layerBInner);

    overlay = document.createElement('div');
    overlay.id = 'mcv-overlay';

    stage.appendChild(layerA);
    stage.appendChild(layerB);
    stage.appendChild(overlay);
    document.body.insertBefore(stage, document.body.firstChild);

    progressBar = document.createElement('div');
    progressBar.id = 'mcv-progress';
    document.body.appendChild(progressBar);

    const dotsEl = document.createElement('div');
    dotsEl.id = 'mcv-dots';
    SCENES.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'mcv-dot';
      d.id = `mcv-dot-${i}`;
      dotsEl.appendChild(d);
    });
    document.body.appendChild(dotsEl);

    badge = document.createElement('div');
    badge.id = 'mcv-badge';
    badge.innerHTML = `
      <div class="mcv-badge-line"></div>
      <div class="mcv-badge-dot"></div>
      <span class="mcv-badge-text" id="mcv-badge-text"></span>
    `;
    document.body.appendChild(badge);
    labelEl = document.getElementById('mcv-badge-text');
  }

  /* ─────────────────────────────────────────────────────────────
     CROSSFADE
  ───────────────────────────────────────────────────────────── */
  let badgeTimer = null;

  function showScene(newIdx) {
    if (newIdx === activeIdx || pending) return;
    pending = true;
    clearTimeout(pendingTimer);

    const scene          = SCENES[newIdx];
    const backLayer      = frontLayer === 'A' ? layerB      : layerA;
    const backLayerInner = frontLayer === 'A' ? layerBInner : layerAInner;
    const frontLayerEl   = frontLayer === 'A' ? layerA      : layerB;

    /* Set image on the inner element (not the layer itself) */
    backLayerInner.style.backgroundImage = `url('${scene.src}')`;
    backLayer.classList.remove('mcv-active', 'mcv-exit');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backLayer.classList.add('mcv-active');
        frontLayerEl.classList.remove('mcv-active');
        frontLayerEl.classList.add('mcv-exit');

        badge.style.color = scene.color;
        updateDots(newIdx);
        updateBadge(scene.label);

        frontLayer = frontLayer === 'A' ? 'B' : 'A';
        activeIdx  = newIdx;

        /* Faster release: 560ms vs old 1050ms */
        pendingTimer = setTimeout(() => {
          frontLayerEl.classList.remove('mcv-exit');
          pending = false;
        }, CFG.PENDING_RELEASE);
      });
    });
  }

  function updateDots(idx) {
    document.querySelectorAll('.mcv-dot').forEach((d, i) => {
      d.classList.toggle('mcv-dot-active', i === idx);
    });
    const dotsEl = document.getElementById('mcv-dots');
    if (dotsEl) dotsEl.classList.add('mcv-dots-show');
  }

  function updateBadge(label) {
    badge.classList.remove('mcv-badge-show');
    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => {
      labelEl.textContent = label;
      badge.classList.add('mcv-badge-show');
      badgeTimer = setTimeout(() => badge.classList.remove('mcv-badge-show'), 2800);
    }, 200);
  }

  /* ─────────────────────────────────────────────────────────────
     PARALLAX — writes only to .mcv-layer-inner via translate3d
     This element has no CSS transition, so there is zero conflict
     with the crossfade animation on its parent .mcv-layer.
  ───────────────────────────────────────────────────────────── */
  function applyParallax(progress) {
    if (!CFG.USE_PARALLAX) return;

    const maxShift = viewH * CFG.PARALLAX_FACTOR;
    const shiftPx  = (0.5 - progress) * maxShift * 2;

    if (lastParallaxShift !== null &&
        Math.abs(shiftPx - lastParallaxShift) < CFG.PARALLAX_MIN_DELTA) {
      return; // sub-threshold — skip style write entirely
    }
    lastParallaxShift = shiftPx;

    const val = shiftPx.toFixed(2);
    /* Active inner layer only */
    const activeInner = frontLayer === 'A' ? layerAInner : layerBInner;
    activeInner.style.transform = `translate3d(0, ${val}px, 0)`;
  }

  /* ─────────────────────────────────────────────────────────────
     RAF LOOP — self-suspending when idle
  ───────────────────────────────────────────────────────────── */
  function loop() {
    const diff = targetScrollY - currentScrollY;
    currentScrollY += diff * CFG.LERP;

    const scrollable = Math.max(1, pageH - viewH);
    const progress   = Math.min(1, Math.max(0, currentScrollY / scrollable));

    /* Scene selection */
    const sceneIdx = Math.min(N - 1, Math.floor(progress * N));
    if (!pending && sceneIdx !== activeIdx) {
      showScene(sceneIdx);
    }

    /* Parallax */
    applyParallax(progress);

    /* Progress bar — dirty-flag write */
    const pct = (progress * 100).toFixed(2) + '%';
    if (pct !== lastProgressPct) {
      progressBar.style.width = pct;
      lastProgressPct = pct;
    }

    /* Self-suspend when caught up and no pending crossfade */
    if (Math.abs(diff) < CFG.LERP_SETTLE && !pending) {
      idleState = true;
      rafHandle = null;
      return;
    }

    rafHandle = requestAnimationFrame(loop);
  }

  /* ─────────────────────────────────────────────────────────────
     SCROLL HANDLER — instantly wakes the rAF loop
  ───────────────────────────────────────────────────────────── */
  function onScroll() {
    targetScrollY = window.scrollY;
    if (idleState) {
      idleState = false;
      rafHandle = requestAnimationFrame(loop);
    }
  }

  /* ─────────────────────────────────────────────────────────────
     PRELOADER
  ───────────────────────────────────────────────────────────── */
  function preload() {
    /* First two scenes: critical path — use <link rel="preload"> */
    SCENES.slice(0, 2).forEach(scene => {
      const link = document.createElement('link');
      link.rel  = 'preload';
      link.as   = 'image';
      link.href = scene.src;
      document.head.appendChild(link);
    });

    /* Remaining: load after page is interactive */
    const preloadRest = () => {
      SCENES.slice(2).forEach(scene => {
        const img = new Image();
        img.src = scene.src;
      });
    };
    if (document.readyState === 'complete') {
      preloadRest();
    } else {
      window.addEventListener('load', preloadRest, { once: true });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     RESIZE
  ───────────────────────────────────────────────────────────── */
  let resizeTimer = null;
  function updateDimensions() {
    pageH = document.documentElement.scrollHeight;
    viewH = window.innerHeight;
    lastParallaxShift = null; // force re-compute
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    buildDOM();
    updateDimensions();
    preload();

    /* Show first scene */
    layerAInner.style.backgroundImage = `url('${SCENES[0].src}')`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        layerA.classList.add('mcv-active');
        activeIdx  = 0;
        frontLayer = 'A';
        badge.style.color = SCENES[0].color;
        updateDots(0);
        updateBadge(SCENES[0].label);
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDimensions, 100);
    }, { passive: true });

    targetScrollY  = window.scrollY;
    currentScrollY = window.scrollY;
    rafHandle = requestAnimationFrame(loop);
  }

  /* ─────────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
