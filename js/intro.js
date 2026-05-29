// ─── GAME SELECT LOGIC ──────────────────────────────────────────────

(function () {
  const intro        = document.getElementById('intro');
  const video        = document.getElementById('intro-video');
  const flashEl      = document.getElementById('flash-overlay');
  const selectScreen = document.getElementById('game-select');
  const selectTiles  = document.getElementById('select-tiles');
  const mainEl       = document.getElementById('main');

  const INTRO_END = 7.3;   // seconds — initial clip ends here
  const SAO_START = 13;    // seconds — SAO replay starts here

  let phase = 'initial-intro'; // initial-intro | game-select | sao-replay | done
  let frozenTime = null;       // video position saved when tab is hidden
  let pendingSaoEnd = false;   // SAO clip ended while tab was hidden
  let saoFinishHandler = null;

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

  // ── Tab visibility — freeze video position, never transition while hidden ─
  document.addEventListener('visibilitychange', () => {
    if (!video || phase === 'game-select' || phase === 'done') return;

    if (document.hidden) {
      frozenTime = video.currentTime;
      video.pause();
      return;
    }

    // Tab is visible again — restore position and resume
    if (frozenTime !== null) {
      video.currentTime = frozenTime;
      frozenTime = null;
    }

    if (pendingSaoEnd && phase === 'sao-replay' && saoFinishHandler) {
      pendingSaoEnd = false;
      saoFinishHandler();
      return;
    }

    if (phase === 'initial-intro') {
      if (video.currentTime >= INTRO_END) {
        video.removeEventListener('timeupdate', onInitialTimeUpdate);
        endIntro();
      } else {
        video.play().catch(() => {});
      }
    } else if (phase === 'sao-replay') {
      video.play().catch(() => saoFinishHandler?.());
    }
  });

  // ── Initial intro — driven by video time, only while tab is visible ─────
  function onInitialTimeUpdate() {
    if (document.hidden) return;
    if (video.currentTime >= INTRO_END) {
      video.removeEventListener('timeupdate', onInitialTimeUpdate);
      endIntro();
    }
  }

  function endIntro() {
    if (document.hidden || intro.classList.contains('hidden')) return;
    phase = 'game-select';
    saoFinishHandler = null;
    video.removeEventListener('timeupdate', onInitialTimeUpdate);
    video.pause();
    flashEl.classList.remove('flash');
    void flashEl.offsetWidth;
    flashEl.classList.add('flash');
    setTimeout(() => {
      intro.classList.add('hidden');
      showGameSelect();
    }, 300);
  }

  if (video) {
    video.addEventListener('timeupdate', onInitialTimeUpdate);
    video.play().catch(() => {});
  } else {
    phase = 'game-select';
    endIntro();
  }

  function showGameSelect() {
    selectScreen.classList.remove('hidden');
    selectScreen.classList.add('visible');
    const tiles = selectTiles.querySelectorAll('.select-tile');
    tiles.forEach((tile, i) => {
      setTimeout(() => tile.classList.add('enter'), 150 + i * 200);
    });
  }

  function onThemeSelect(themeId, tile) {
    tile.classList.add('locked');
    selectTiles.querySelectorAll('.select-tile').forEach(t => {
      if (t !== tile) t.classList.add('fade-out');
    });

    setTimeout(() => {
      selectScreen.classList.add('hidden');

      if (themeId === 'sao' && video) {
        playSaoTransition(themeId);
        return;
      }

      phase = 'done';
      saoFinishHandler = null;
      flashEl.classList.remove('flash');
      void flashEl.offsetWidth;
      flashEl.classList.add('flash');
      setTimeout(() => {
        applyTheme(themeId);
        showPortfolio();
      }, 350);
    }, 700);
  }

  function playSaoTransition(themeId) {
    phase = 'sao-replay';
    pendingSaoEnd = false;
    frozenTime = null;

    function finishSaoIntro() {
      if (document.hidden) {
        pendingSaoEnd = true;
        return;
      }
      phase = 'done';
      saoFinishHandler = null;
      video.pause();
      flashEl.classList.remove('flash');
      void flashEl.offsetWidth;
      flashEl.classList.add('flash');
      setTimeout(() => {
        intro.classList.add('hidden');
        applyTheme(themeId);
        showPortfolio();
      }, 300);
    }

    saoFinishHandler = finishSaoIntro;

    function revealAndPlay() {
      intro.classList.remove('hidden');
      video.addEventListener('ended', finishSaoIntro, { once: true });
      video.play().catch(finishSaoIntro);
    }

    function seekToStart() {
      if (Math.abs(video.currentTime - SAO_START) < 0.1) {
        revealAndPlay();
        return;
      }
      video.addEventListener('seeked', revealAndPlay, { once: true });
      video.currentTime = SAO_START;
    }

    if (video.readyState >= 1) {
      seekToStart();
    } else {
      video.addEventListener('loadedmetadata', seekToStart, { once: true });
    }
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
