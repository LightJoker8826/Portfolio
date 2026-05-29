// ─── INTRO + GAME SELECT LOGIC ──────────────────────────────────────────────

(function () {
  const intro       = document.getElementById('intro');
  const flashEl     = document.getElementById('flash-overlay');
  const systemText  = document.getElementById('system-text');
  const linkStart   = document.getElementById('link-start-text');
  const arcCircle   = document.getElementById('arc-circle');
  const selectScreen = document.getElementById('game-select');
  const selectTiles  = document.getElementById('select-tiles');
  const mainEl       = document.getElementById('main');
  const video        = document.getElementById('intro-video');

  // ── Arc circumference ──────────────────────────────────────────────────
  const CIRC = 2 * Math.PI * 90; // r=90
  arcCircle.style.strokeDasharray  = CIRC;
  arcCircle.style.strokeDashoffset = CIRC;

  // ── Check for saved theme ──────────────────────────────────────────────
  const saved = getSavedTheme();
  if (saved) {
    skipToPortfolio(saved);
    return;
  }

  // ── Build game-select tiles from registry ──────────────────────────────
  THEMES.forEach(theme => {
    const tile = document.createElement('div');
    tile.className = 'select-tile';
    tile.dataset.themeId = theme.id;
    tile.style.setProperty('--tile-color', theme.selectColor);
    tile.style.setProperty('--tile-bg', theme.selectBg);
    tile.innerHTML = `
      <div class="tile-rings">
        <div class="tile-ring t-r1"></div>
        <div class="tile-ring t-r2"></div>
      </div>
      <div class="tile-icon">${theme.icon}</div>
      <div class="tile-label">${theme.label}</div>
      <div class="tile-sub">${theme.subtitle}</div>
      <div class="tile-glow-bar"></div>
    `;
    tile.addEventListener('click', () => onThemeSelect(theme.id, tile));
    selectTiles.appendChild(tile);
  });

  // ── Run intro sequence ─────────────────────────────────────────────────
  runIntro();

  function runIntro() {
    // Phase 1: brief white hold then fade to reveal video + rings
    setTimeout(() => {
      intro.classList.add('reveal-video');
    }, 200);

    // Phase 2: type system text
    setTimeout(() => {
      typeText(systemText, 'NERVE GEAR SYSTEM ONLINE', 60, () => {
        // Phase 3: fill arc
        fillArc(1800, () => {
          // Phase 4: LINK START slam
          linkStart.classList.add('active');
          setTimeout(() => {
            // Phase 5: white flash → game select
            flashEl.classList.add('flash');
            setTimeout(() => {
              intro.classList.add('hidden');
              showGameSelect();
            }, 400);
          }, 1000);
        });
      });
    }, 900);
  }

  function typeText(el, text, delay, cb) {
    el.classList.add('visible');
    el.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (cb) cb();
      }
    }, delay);
  }

  function fillArc(duration, cb) {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      arcCircle.style.strokeDashoffset = CIRC * (1 - progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (cb) cb();
      }
    }
    requestAnimationFrame(step);
  }

  function showGameSelect() {
    selectScreen.classList.remove('hidden');
    selectScreen.classList.add('visible');
    // Stagger tile entrances
    const tiles = selectTiles.querySelectorAll('.select-tile');
    tiles.forEach((tile, i) => {
      setTimeout(() => {
        tile.classList.add('enter');
      }, 150 + i * 200);
    });
  }

  function onThemeSelect(themeId, tile) {
    // Lock-on animation
    tile.classList.add('locked');
    const tiles = selectTiles.querySelectorAll('.select-tile');
    tiles.forEach(t => { if (t !== tile) t.classList.add('fade-out'); });

    setTimeout(() => {
      flashEl.classList.add('flash');
      setTimeout(() => {
        selectScreen.classList.add('hidden');
        applyTheme(themeId);
        showPortfolio();
      }, 350);
    }, 700);
  }

  function showPortfolio() {
    mainEl.classList.remove('hidden');
    mainEl.classList.add('fade-in');
    if (window.initBackground) window.initBackground();
    if (window.initAnimations) window.initAnimations();
  }

  function skipToPortfolio(themeId) {
    intro.classList.add('hidden');
    selectScreen.classList.add('hidden');
    applyTheme(themeId, true);
    mainEl.classList.remove('hidden');
    mainEl.classList.add('fade-in');
    if (window.initBackground) window.initBackground();
    if (window.initAnimations) window.initAnimations();
  }

  // ── Theme switcher button ──────────────────────────────────────────────
  document.getElementById('theme-switcher').addEventListener('click', function () {
    const nextId = this.getAttribute('data-next') || THEMES[0].id;
    applyTheme(nextId);

    // Trigger Zelda menu open animation when switching to it
    if (nextId === 'zelda') {
      const mainContent = document.querySelector('#main .main-content');
      if (mainContent) {
        mainContent.classList.remove('zelda-open');
        void mainContent.offsetWidth;
        mainContent.classList.add('zelda-open');
      }
    }
  });
})();
