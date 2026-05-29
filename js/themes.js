// ─── THEME REGISTRY ────────────────────────────────────────────────────────
// To add a new theme: add an object below + create css/theme-<id>.css
// The select screen, switcher, and localStorage logic all read from this array.

const THEMES = [
  {
    id: 'sao',
    label: 'Sword Art Online',
    subtitle: 'AINCRAD SERVER',
    css: 'css/theme-sao.css',
    bg: 'particles',
    selectColor: '#00d4ff',
    selectBg: 'rgba(0, 8, 20, 0.92)',
    icon: '⚔',
    contactPrompt: '&gt; SEND MESSAGE',
    sectionProjects: 'QUEST LOG',
    sectionGithub: 'GITHUB TERMINAL',
    sectionAchievements: 'ACHIEVEMENTS',
    sectionContact: 'CONTACT',
    heroTag: '[ PLAYER DATA ]',
  },
  {
    id: 'zelda',
    label: 'Ocarina of Time',
    subtitle: 'SELECT ITEM',
    css: 'css/theme-zelda.css',
    bg: 'stars',
    selectColor: '#c8a800',
    selectBg: 'rgba(5, 10, 25, 0.92)',
    icon: '🗡',
    contactPrompt: '[ SEND A LETTER ]',
    sectionProjects: 'ITEMS',
    sectionGithub: 'MAP',
    sectionAchievements: 'QUEST STATUS',
    sectionContact: 'To Map',
    heroTag: 'PLAYER',
  },
  // ─── Add more themes here ───────────────────────────────────────────────
];

// ─── RUNTIME STATE ──────────────────────────────────────────────────────────
let currentTheme = null;

function getThemeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

function applyTheme(themeId, skipSave) {
  const theme = getThemeById(themeId);
  currentTheme = theme;

  document.documentElement.setAttribute('data-theme', theme.id);

  // Swap theme stylesheet
  let link = document.getElementById('theme-css');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'theme-css';
    document.head.appendChild(link);
  }
  link.href = theme.css;

  // Swap theme-specific text nodes
  document.querySelectorAll('[data-theme-key]').forEach(el => {
    const key = el.dataset.themeKey;
    if (theme[key] !== undefined) {
      if (el.dataset.themeHtml) {
        el.innerHTML = theme[key];
      } else {
        el.textContent = theme[key];
      }
    }
  });

  // Update theme switcher icon
  const switcher = document.getElementById('theme-switcher');
  if (switcher) {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    switcher.title = `Switch to ${next.label}`;
    switcher.setAttribute('data-next', next.id);
  }

  if (!skipSave) {
    localStorage.setItem('portfolio-theme', theme.id);
  }

  if (window.switchBackground) {
    window.switchBackground(theme.bg);
  }

  return theme;
}

function getSavedTheme() {
  return localStorage.getItem('portfolio-theme');
}
