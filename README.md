# Surendra Singh — Portfolio

SAO + Zelda: Ocarina of Time dual-theme portfolio. Built with plain HTML, CSS, and JavaScript — no build step required.

## Features

- **Link Start intro** — SAO NerveGear boot sequence with spinning rings, progress arc, and video background
- **Game Select screen** — choose SAO or Zelda OoT theme after the intro
- **Theme persistence** — choice saved in browser localStorage; return visits skip straight to your last theme
- **Theme switcher** — bottom-right button to swap themes anytime
- **SAO theme** — black/cyan holographic HUD, hex grid, scanlines, particle canvas
- **Zelda OoT theme** — N64 pause menu aesthetic, beveled stone panels, gold buttons, star field canvas
- **Extensible** — add a new theme by adding one entry to `js/themes.js` + a new CSS file

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `portfolio` or `<username>.github.io`)
2. Push this folder to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "initial portfolio"
   git branch -M main
   git remote add origin https://github.com/LightJoker8826/<repo-name>.git
   git push -u origin main
   ```
3. Go to your repo on GitHub → **Settings** → **Pages**
4. Under **Source**, select `Deploy from a branch` → `main` → `/ (root)` → **Save**
5. Your site will be live at `https://lightjoker8826.github.io/<repo-name>/`

## Adding a New Theme

1. Add an entry to the `THEMES` array in `js/themes.js`:
   ```js
   {
     id: 'terraria',
     label: 'Terraria',
     subtitle: 'WORLD SELECT',
     css: 'css/theme-terraria.css',
     bg: 'particles',          // 'particles' or 'stars'
     selectColor: '#4caf50',
     selectBg: 'rgba(5, 15, 5, 0.92)',
     icon: '⛏',
     contactPrompt: '[ SEND MAIL ]',
     sectionProjects: 'INVENTORY',
     sectionGithub: 'MAP',
     sectionAchievements: 'BESTIARY',
     sectionContact: 'SIGN',
     heroTag: 'CHARACTER',
   },
   ```
2. Create `css/theme-terraria.css` with your styles
3. The select screen, switcher, and theme logic update automatically

## File Structure

```
portfolio/
  index.html              Main page
  css/
    style.css             Shared layout + intro/select styles
    theme-sao.css         SAO theme
    theme-zelda.css       Zelda OoT theme
  js/
    themes.js             Theme registry + apply logic
    intro.js              Link Start sequence + game select
    main.js               Canvas backgrounds + scroll animations
  assets/
    sao-intro.mp4         Video played during intro sequence
```
