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
  let frozenTime = null;
  let lastVisibleTime = 0;   // furthest point actually watched while tab visible
  let pendingSaoEnd = false;
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

  function resumeVideoAt(time, onReady) {
    if (Math.abs(video.currentTime - time) < 0.05) {
      onReady();
      return;
    }
    video.addEventListener('seeked', () => onReady(), { once: true });
    video.currentTime = time;
  }

  // ── Tab visibility — freeze at last visible frame, resume after seek ───
  document.addEventListener('visibilitychange', () => {
    if (!video || phase === 'game-select' || phase === 'done') return;

    if (document.hidden) {
      frozenTime = lastVisibleTime;
      video.pause();
      return;
    }

    if (pendingSaoEnd && phase === 'sao-replay' && saoFinishHandler) {
      pendingSaoEnd = false;
      saoFinishHandler();
      return;
    }

    const resumeAt = frozenTime !== null ? frozenTime : video.currentTime;
    frozenTime = null;

    if (phase === 'initial-intro') {
      if (lastVisibleTime >= INTRO_END) {
        video.removeEventListener('timeupdate', onInitialTimeUpdate);
        endIntro();
        return;
      }
      resumeVideoAt(resumeAt, () => video.play().catch(() => {}));
    } else if (phase === 'sao-replay') {
      resumeVideoAt(resumeAt, () => video.play().catch(() => saoFinishHandler?.()));
    }
  });

  function fadeOutIntro(callback) {
    intro.classList.remove('fade-out');
    void intro.offsetWidth;
    intro.classList.add('fade-out');

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      intro.classList.remove('fade-out');
      intro.classList.add('hidden');
      callback?.();
    };

    intro.addEventListener('transitionend', (e) => {
      if (e.target === intro && e.propertyName === 'opacity') finish();
    }, { once: true });
    setTimeout(finish, 950);
  }

  // ── Initial intro — progress only counts while tab is visible ───────────
  function onInitialTimeUpdate() {
    if (document.hidden || phase !== 'initial-intro') return;

    lastVisibleTime = Math.max(lastVisibleTime, video.currentTime);

    if (lastVisibleTime >= INTRO_END) {
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
    showGameSelect();
    fadeOutIntro();
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
    lastVisibleTime = SAO_START;

    function finishSaoIntro() {
      video.removeEventListener('timeupdate', onSaoTimeUpdate);
      if (document.hidden) {
        pendingSaoEnd = true;
        return;
      }
      phase = 'done';
      saoFinishHandler = null;
      video.pause();
      applyTheme(themeId);
      mainEl.classList.remove('hidden');
      if (window.initBackground) window.initBackground();
      fadeOutIntro(() => {
        if (window.initAnimations) window.initAnimations();
        mainEl.classList.add('fade-in');
      });
    }

    saoFinishHandler = finishSaoIntro;

    function revealAndPlay() {
      intro.classList.remove('hidden', 'fade-out');
      video.addEventListener('timeupdate', onSaoTimeUpdate);
      video.addEventListener('ended', finishSaoIntro, { once: true });
      video.play().catch(finishSaoIntro);
    }

    function onSaoTimeUpdate() {
      if (document.hidden || phase !== 'sao-replay') return;
      lastVisibleTime = Math.max(lastVisibleTime, video.currentTime);
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
