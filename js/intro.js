// ─── GAME SELECT LOGIC ──────────────────────────────────────────────

(function () {
  const flashEl      = document.getElementById('flash-overlay');
  const selectScreen = document.getElementById('game-select');
  const selectTiles  = document.getElementById('select-tiles');
  const mainEl       = document.getElementById('main');

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

  // Always show game select on load
  showGameSelect();

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
