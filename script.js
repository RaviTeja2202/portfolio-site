const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const canvas = document.getElementById('orbital');
const ctx = canvas.getContext('2d');

const prefersDark =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

function setTheme(mode) {
  root.dataset.theme = mode;
  toggle.querySelector('.theme-toggle__icon').textContent =
    mode === 'light' ? '🌙' : '☀️';
  localStorage.setItem('portfolio-theme', mode);
}

function toggleTheme() {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(next);
}

toggle.addEventListener('click', toggleTheme);

const savedTheme = localStorage.getItem('portfolio-theme');
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

const orbCount = 45;
const orbs = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

for (let i = 0; i < orbCount; i += 1) {
  orbs.push({
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    radius: random(0.8, 2.5),
    speed: random(0.2, 1.2),
    angle: random(0, Math.PI * 2),
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle =
    root.dataset.theme === 'light'
      ? 'rgba(14, 202, 171, 0.08)'
      : 'rgba(140, 255, 218, 0.08)';

  orbs.forEach((orb) => {
    orb.angle += orb.speed * 0.002;
    orb.x += Math.cos(orb.angle) * orb.speed;
    orb.y += Math.sin(orb.angle) * orb.speed;

    if (orb.x > canvas.width) orb.x = 0;
    if (orb.x < 0) orb.x = canvas.width;
    if (orb.y > canvas.height) orb.y = 0;
    if (orb.y < 0) orb.y = canvas.height;

    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document
  .querySelectorAll('.panel, .project-card, .timeline__item, .achievements article')
  .forEach((el) => {
    el.classList.add('pre-animation');
    observer.observe(el);
  });

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');

function applyFilter(button) {
  filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
  const filter = button.dataset.filter;
  cards.forEach((card) => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !match);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => applyFilter(button));
});

if (filterButtons.length) {
  applyFilter(filterButtons[0]);
}

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = contactForm.querySelector('.form-status');
    const action = contactForm.getAttribute('action');
    const formData = new FormData(contactForm);

    try {
      const response = await fetch(action, {
        method: 'POST',
        mode: 'cors',
        body: formData,
      });
      if (response.ok) {
        if (status) status.textContent = 'Thanks! I will respond shortly.';
        contactForm.reset();
      } else {
        if (status) status.textContent = 'Something went wrong. Please email me directly.';
      }
    } catch (error) {
      if (status) status.textContent = 'Network error. Please email me instead.';
    }

    setTimeout(() => {
      if (status) status.textContent = '';
    }, 6000);
  });
}
