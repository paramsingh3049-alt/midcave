/* ═══════════════════════════════════════════════════════════════
   MIDCAV DIGITAL TECHNOLOGIES
   Cinematic Scroll Background Engine v2.0
   ─────────────────────────────────────────────────────────────
   • A/B layer crossfade (opacity + blur-to-sharp + Ken Burns)
   • Smooth parallax shift per-frame via rAF
   • Scroll-mapped image segments with pre-roll zone
   • Gold progress bar
   • Dimension label badge
   • Mobile/touch + reduced-motion aware
   ═══════════════════════════════════════════════════════════════ */

(function MIDCAVScrollBG() {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     CONFIG
  ───────────────────────────────────────────────────────────── */
  const CFG = {
    CROSSFADE_MS:      900,   // crossfade transition duration
    BLUR_START:        16,    // blur (px) when image first appears
    SCALE_ACTIVE:      1.0,   // final scale of active image
    SCALE_ENTER:       1.09,  // scale when image enters
    SCALE_EXIT:        0.96,  // scale when image exits
    PARALLAX_FACTOR:   0.20,  // vertical parallax speed (0=static, 1=full scroll)
    PROGRESS_SEGMENT:  0.95,  // fraction of segment before triggering next image
  };

  /* ─────────────────────────────────────────────────────────────
     IMAGE MANIFEST — uses existing MIDCAV project images
     Mapped to each MIDCAV creative dimension
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
  let layerA, layerB, overlay, badge, labelEl, progressBar;
  let frontLayer = 'A';     // which layer is currently on top (visible)
  let activeIdx  = -1;      // currently displayed scene index
  let pending    = false;   // crossfade in progress
  let pendingTimer = null;

  /* Smooth scroll state */
  let currentScrollY = 0;
  let targetScrollY  = 0;
  let isRunning      = false;
  let rafHandle      = null;

  /* Dimensions */
  let pageH = 1, viewH = 1;

  /* ─────────────────────────────────────────────────────────────
     CSS
  ───────────────────────────────────────────────────────────── */
  function injectCSS() {
    const css = `
      /* ── MIDCAV Background Stage ── */
      #mcv-stage {
        position: fixed;
        inset: 0;
        z-index: -10;
        overflow: hidden;
        background: #030508;
        pointer-events: none;
      }

      /* ── Background image layers ── */
      .mcv-layer {
        position: absolute;
        /* Extra bleed for parallax movement room */
        top: -12%; left: -4%;
        width: 108%; height: 124%;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        opacity: 0;
        transform: scale(${CFG.SCALE_ENTER}) translateY(0px);
        filter: blur(${CFG.BLUR_START}px) brightness(0.65);
        will-change: transform, opacity, filter;
        transition:
          opacity  ${CFG.CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
          filter   ${CFG.CROSSFADE_MS * 1.15}ms cubic-bezier(0.22, 1, 0.36, 1),
          transform ${CFG.CROSSFADE_MS * 1.1}ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      /* Active = fully revealed */
      .mcv-layer.mcv-active {
        opacity: 1;
        filter: blur(0px) brightness(0.72);
        transform: scale(${CFG.SCALE_ACTIVE}) translateY(0px);
      }
      /* Exiting = fade out + scale down */
      .mcv-layer.mcv-exit {
        opacity: 0;
        filter: blur(8px) brightness(0.55);
        transform: scale(${CFG.SCALE_EXIT}) translateY(0px);
        transition:
          opacity  ${CFG.CROSSFADE_MS * 0.85}ms cubic-bezier(0.22, 1, 0.36, 1),
          filter   ${CFG.CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
          transform ${CFG.CROSSFADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      /* ── Multi-layer dark overlay — top-to-bottom gradient keeps all text readable ── */
      #mcv-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          /* Top darkening for navbar */
          linear-gradient(to bottom,
            rgba(3,5,8,0.85)  0%,
            rgba(3,5,8,0.20)  14%,
            rgba(3,5,8,0.08)  40%,
            rgba(3,5,8,0.18)  65%,
            rgba(3,5,8,0.55)  85%,
            rgba(3,5,8,0.90)  100%
          ),
          /* Edge vignette */
          radial-gradient(ellipse 120% 120% at 50% 50%,
            transparent 35%,
            rgba(3,5,8,0.55) 100%
          );
      }

      /* ── Scroll progress bar ── */
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
        transform-origin: left center;
      }
      @keyframes mcv-progress-shimmer {
        0%   { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }

      /* ── Dimension label badge ── */
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
        width: 28px;
        height: 1px;
        background: currentColor;
        opacity: 0.5;
      }
      .mcv-badge-dot {
        width: 5px; height: 5px;
        border-radius: 50%;
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
        font-size: 0.58rem;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: currentColor;
        white-space: nowrap;
      }

      /* ── Index indicator dots (side rail) ── */
      #mcv-dots {
        position: fixed;
        right: 2rem;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 998;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      #mcv-dots.mcv-dots-show { opacity: 1; }
      .mcv-dot {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        transition: background 0.4s ease, transform 0.4s ease;
        flex-shrink: 0;
      }
      .mcv-dot.mcv-dot-active {
        background: #c8a96e;
        transform: scale(1.8);
      }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        #mcv-badge { bottom: 1.5rem; right: 1.5rem; font-size: 0.5rem; }
        #mcv-dots  { display: none; }
        .mcv-layer { top: -6%; left: -2%; width: 104%; height: 112%; }
      }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .mcv-layer {
          transition: opacity 300ms ease !important;
          filter: brightness(0.72) !important;
          transform: none !important;
        }
        .mcv-layer.mcv-active {
          filter: brightness(0.72) !important;
          transform: none !important;
        }
        .mcv-layer.mcv-exit {
          transform: none !important;
        }
      }
    `;
    const el = document.createElement('style');
    el.id = 'mcv-styles';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ─────────────────────────────────────────────────────────────
     DOM CONSTRUCTION
  ───────────────────────────────────────────────────────────── */
  function buildDOM() {
    /* Stage */
    const stage = document.createElement('div');
    stage.id = 'mcv-stage';
    stage.setAttribute('aria-hidden', 'true');
    stage.setAttribute('role', 'presentation');

    /* Image layers */
    layerA = document.createElement('div');
    layerA.className = 'mcv-layer';
    layerA.id = 'mcv-layer-a';

    layerB = document.createElement('div');
    layerB.className = 'mcv-layer';
    layerB.id = 'mcv-layer-b';

    /* Overlay */
    overlay = document.createElement('div');
    overlay.id = 'mcv-overlay';

    stage.appendChild(layerA);
    stage.appendChild(layerB);
    stage.appendChild(overlay);
    document.body.insertBefore(stage, document.body.firstChild);

    /* Progress bar */
    progressBar = document.createElement('div');
    progressBar.id = 'mcv-progress';
    document.body.appendChild(progressBar);

    /* Dot rail */
    const dotsEl = document.createElement('div');
    dotsEl.id = 'mcv-dots';
    SCENES.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'mcv-dot';
      d.id = `mcv-dot-${i}`;
      dotsEl.appendChild(d);
    });
    document.body.appendChild(dotsEl);

    /* Label badge */
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
     CROSSFADE ENGINE
  ───────────────────────────────────────────────────────────── */
  let badgeTimer = null;

  function showScene(newIdx) {
    if (newIdx === activeIdx || pending) return;

    pending = true;
    clearTimeout(pendingTimer);

    const scene   = SCENES[newIdx];
    const front   = frontLayer === 'A' ? layerA : layerB;
    const back    = frontLayer === 'A' ? layerB : layerA;

    /* Load image into back layer */
    back.style.backgroundImage = `url('${scene.src}')`;
    back.classList.remove('mcv-active', 'mcv-exit');

    /* Double-rAF to ensure browser paints the new bg before transition */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        /* Bring back layer forward */
        back.classList.add('mcv-active');

        /* Push front layer out */
        front.classList.remove('mcv-active');
        front.classList.add('mcv-exit');

        /* Update accent color */
        badge.style.color = scene.color;
        overlay.style.setProperty('--scene-color', scene.color);

        /* Update dots */
        updateDots(newIdx);

        /* Update label */
        updateBadge(scene.label, newIdx);

        /* Swap front reference */
        frontLayer = frontLayer === 'A' ? 'B' : 'A';
        activeIdx  = newIdx;

        /* Unlock after transition ends */
        pendingTimer = setTimeout(() => {
          front.classList.remove('mcv-exit');
          pending = false;
        }, CFG.CROSSFADE_MS + 150);

      });
    });
  }

  /* Update dot rail */
  function updateDots(idx) {
    document.querySelectorAll('.mcv-dot').forEach((d, i) => {
      d.classList.toggle('mcv-dot-active', i === idx);
    });
    const dotsEl = document.getElementById('mcv-dots');
    if (dotsEl) dotsEl.classList.add('mcv-dots-show');
  }

  /* Update label badge */
  function updateBadge(label, idx) {
    badge.classList.remove('mcv-badge-show');
    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => {
      labelEl.textContent = label;
      badge.classList.add('mcv-badge-show');
      /* Auto-hide after 2.8s */
      badgeTimer = setTimeout(() => {
        badge.classList.remove('mcv-badge-show');
      }, 2800);
    }, 250);
  }

  /* ─────────────────────────────────────────────────────────────
     PARALLAX — applied every frame via rAF loop
  ───────────────────────────────────────────────────────────── */
  function applyParallax(progress) {
    /* Shift range: [-maxShift, +maxShift] centered at mid-scroll */
    const maxShift  = viewH * CFG.PARALLAX_FACTOR;
    const shiftPx   = (progress - 0.5) * maxShift * 2;

    /* Apply to whichever layer is active (others are invisible) */
    const activeLayer = frontLayer === 'A' ? layerA : layerB;
    const exitLayer   = frontLayer === 'A' ? layerB : layerA;

    /* Use CSS transform directly (bypasses transition for parallax smoothness) */
    applyLayerParallax(activeLayer, shiftPx, CFG.SCALE_ACTIVE, activeLayer.classList.contains('mcv-active'));
    applyLayerParallax(exitLayer,  shiftPx, CFG.SCALE_EXIT,   exitLayer.classList.contains('mcv-exit'));
  }

  function applyLayerParallax(layer, shiftPx, scale, isVisible) {
    if (!isVisible) return;
    /* Override only the translateY within the existing transition.
       We set it inline so it overrides what the CSS transition set,
       but we only do it AFTER the transition has settled (no mid-crossfade jank). */
    if (!pending) {
      layer.style.transform = `scale(${scale}) translateY(${shiftPx.toFixed(2)}px)`;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     RAF LOOP — smooth scroll + parallax
  ───────────────────────────────────────────────────────────── */
  function loop() {
    rafHandle = requestAnimationFrame(loop);

    /* Lerp current scroll toward target */
    currentScrollY += (targetScrollY - currentScrollY) * 0.10;

    /* Compute progress [0, 1] */
    const scrollable = Math.max(1, pageH - viewH);
    const progress   = Math.min(1, Math.max(0, currentScrollY / scrollable));

    /* Determine which scene to show */
    const rawIdx = Math.floor(progress * N);
    const sceneIdx = Math.min(N - 1, rawIdx);

    if (!pending && sceneIdx !== activeIdx) {
      showScene(sceneIdx);
    }

    /* Parallax every frame */
    applyParallax(progress);

    /* Progress bar */
    progressBar.style.width = (progress * 100).toFixed(3) + '%';
  }

  /* ─────────────────────────────────────────────────────────────
     SCROLL HANDLER
  ───────────────────────────────────────────────────────────── */
  function onScroll() {
    targetScrollY = window.scrollY;
  }

  /* ─────────────────────────────────────────────────────────────
     IMAGE PRELOADER
  ───────────────────────────────────────────────────────────── */
  function preload() {
    SCENES.forEach(scene => {
      const img = new Image();
      img.src = scene.src;
    });
  }

  /* ─────────────────────────────────────────────────────────────
     RESIZE
  ───────────────────────────────────────────────────────────── */
  function updateDimensions() {
    pageH = document.documentElement.scrollHeight;
    viewH = window.innerHeight;
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    buildDOM();
    updateDimensions();
    preload();

    /* Show first scene immediately */
    layerA.style.backgroundImage = `url('${SCENES[0].src}')`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        layerA.classList.add('mcv-active');
        activeIdx  = 0;
        frontLayer = 'A';
        badge.style.color = SCENES[0].color;
        updateDots(0);
        updateBadge(SCENES[0].label, 0);
      });
    });

    /* Listeners */
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      updateDimensions();
    }, { passive: true });

    /* Start rAF loop */
    targetScrollY  = window.scrollY;
    currentScrollY = window.scrollY;
    loop();
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
