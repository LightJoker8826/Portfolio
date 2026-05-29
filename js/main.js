// ─── BACKGROUND CANVAS + SCROLL ANIMATIONS ──────────────────────────────────

const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let animId   = null;
let bgMode   = 'particles';

// ── Public API called from intro.js / themes.js ───────────────────────────
window.initBackground = function () {
  resize();
  switchBackground(currentTheme ? currentTheme.bg : 'particles');
};

window.switchBackground = function (mode) {
  bgMode = mode;
  if (animId) cancelAnimationFrame(animId);
  if (mode === 'particles') startParticles();
  else if (mode === 'stars')  startStars();
};

window.initAnimations = function () {
  animateSkillBars();
  scrollReveal();
};

// ── Resize ────────────────────────────────────────────────────────────────
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

// ═══════════════════════════════════════════════════════════════════════════
//  SAO — PARTICLE FIELD
// ═══════════════════════════════════════════════════════════════════════════
function startParticles() {
  const PARTICLE_COUNT = 120;
  const MAX_DIST = 140;
  const COLOR = '#00d4ff';

  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r:  Math.random() * 2 + 0.5,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move + wrap
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });

    // Draw connections
    ctx.strokeStyle = COLOR;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          ctx.globalAlpha = (1 - dist / MAX_DIST) * 0.25;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    ctx.globalAlpha = 1;
    particles.forEach(p => {
      ctx.shadowBlur   = 8;
      ctx.shadowColor  = COLOR;
      ctx.fillStyle    = COLOR;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }
  draw();
}

// ═══════════════════════════════════════════════════════════════════════════
//  ZELDA — STAR FIELD
// ═══════════════════════════════════════════════════════════════════════════
function startStars() {
  const STAR_COUNT = 200;

  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height,
    r:    Math.random() * 1.5 + 0.2,
    twinkle: Math.random() * Math.PI * 2,
    speed:   Math.random() * 0.02 + 0.005,
  }));

  // Shooting stars pool
  const shooters = [];
  function spawnShooter() {
    shooters.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height * 0.5,
      vx:    (Math.random() * 4 + 2) * (Math.random() < 0.5 ? 1 : -1),
      vy:    Math.random() * 3 + 1,
      life:  1,
      decay: Math.random() * 0.015 + 0.01,
      len:   Math.random() * 60 + 40,
    });
  }
  setInterval(spawnShooter, 3000 + Math.random() * 4000);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    stars.forEach(s => {
      s.twinkle += s.speed;
      const alpha = 0.4 + Math.sin(s.twinkle) * 0.3;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff5cc';
      ctx.shadowBlur  = 3;
      ctx.shadowColor = '#c8a800';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      ctx.globalAlpha = s.life * 0.8;
      const grad = ctx.createLinearGradient(
        s.x, s.y,
        s.x - s.vx * s.len / 5, s.y - s.vy * s.len / 5
      );
      grad.addColorStop(0, '#fff5cc');
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur  = 6;
      ctx.shadowColor = '#c8a800';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * (s.len / 5), s.y - s.vy * (s.len / 5));
      ctx.stroke();

      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0) shooters.splice(i, 1);
    }

    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }
  draw();
}

// ═══════════════════════════════════════════════════════════════════════════
//  SKILL BARS
// ═══════════════════════════════════════════════════════════════════════════
function animateSkillBars() {
  document.querySelectorAll('.skill-bar').forEach((bar, i) => {
    const value   = parseInt(bar.dataset.value) || 80;
    const label   = bar.dataset.label || '';
    bar.innerHTML = `
      <span class="skill-label">${label}</span>
      <div class="skill-track">
        <div class="skill-fill" data-target="${value}"></div>
      </div>
      <span class="skill-val">${value}%</span>
    `;
    setTimeout(() => {
      const fill = bar.querySelector('.skill-fill');
      fill.style.width = value + '%';
    }, 300 + i * 150);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════════════════
function scrollReveal() {
  const targets = document.querySelectorAll(
    '.project-card, .github-panel, .repo-card, .achievement-card, .contact-panel, .section-title'
  );

  targets.forEach(el => el.classList.add('reveal-hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

// ── Zelda magic bar fill on theme load ───────────────────────────────────
document.addEventListener('themeapplied', () => {
  const bar = document.querySelector('.magic-fill');
  if (bar) {
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = '100%'; }, 100);
  }
});
