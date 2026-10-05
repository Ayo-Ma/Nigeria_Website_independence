const body = document.body;
const loader = document.getElementById('loader');
const count = document.getElementById('loaderCount');
const line = document.getElementById('loaderLine');
const status = document.getElementById('loaderStatus');
const lightLeak = document.querySelector('.light-leak');
const anthem = document.getElementById('anthem');

body.classList.add('loading');
let loadValue = 0;
const statuses = ['Gathering memory', 'Raising the colours', 'Carrying the dream', 'Ready'];
const loadTimer = setInterval(() => {
  loadValue = Math.min(100, loadValue + Math.ceil(Math.random() * 4));
  count.textContent = String(loadValue).padStart(2, '0');
  line.style.width = `${loadValue}%`;
  status.textContent = statuses[Math.min(3, Math.floor(loadValue / 28))];
  if (loadValue === 100) {
    clearInterval(loadTimer);
    setTimeout(() => {
      loader.classList.add('done');
      body.classList.remove('loading');
      const hero = document.querySelector('.hero');
      hero.classList.add('is-active');
      hero.querySelector('.reveal').classList.add('visible');
      lightLeak.classList.add('flash');
    }, 500);
  }
}, 48);

const sections = [...document.querySelectorAll('.chapter')];
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-active');
    entry.target.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    lightLeak.classList.remove('flash');
    requestAnimationFrame(() => lightLeak.classList.add('flash'));
  });
}, { threshold: 0.32 });
sections.forEach((section) => revealObserver.observe(section));

const progressBar = document.getElementById('progressBar');
let scrollTicking = false;
function updateScrollEffects() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = `${Math.max(0, Math.min(100, scrollY / maxScroll * 100))}%`;
    document.querySelectorAll('.parallax').forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      const speed = Number(el.dataset.speed || 0.06);
      el.style.transform = `translate3d(0, ${-rect.top * speed}px, 0) scale(1.06)`;
    });
    scrollTicking = false;
  });
}
addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

const soundBtn = document.getElementById('soundBtn');
let soundOn = false;
let fadeTimer;
function fadeAudio(target, duration = 900) {
  clearInterval(fadeTimer);
  const start = anthem.volume;
  const steps = 24;
  let step = 0;
  fadeTimer = setInterval(() => {
    step += 1;
    anthem.volume = Math.max(0, Math.min(1, start + (target - start) * step / steps));
    if (step >= steps) clearInterval(fadeTimer);
  }, duration / steps);
}
async function startSound() {
  try {
    anthem.volume = 0;
    await anthem.play();
    fadeAudio(0.78, 1200);
    soundOn = true;
    soundBtn.classList.add('on');
    soundBtn.setAttribute('aria-pressed', 'true');
    soundBtn.querySelector('.sound__label').textContent = 'Anthem on';
  } catch (_) {
    soundBtn.querySelector('.sound__label').textContent = 'Tap for sound';
  }
}
function stopSound() {
  fadeAudio(0, 500);
  setTimeout(() => anthem.pause(), 520);
  soundOn = false;
  soundBtn.classList.remove('on');
  soundBtn.setAttribute('aria-pressed', 'false');
  soundBtn.querySelector('.sound__label').textContent = 'Sound off';
}
soundBtn.addEventListener('click', () => soundOn ? stopSound() : startSound());

const filmBtn = document.getElementById('filmBtn');
const skipFilm = document.getElementById('skipFilm');
let filmActive = false;
let filmIndex = 0;
let filmTimer;
const sceneDurations = [7000, 8500, 9500, 8000, 8500, 9500, 9000];
function playNextMoment() {
  if (!filmActive) return;
  if (filmIndex >= sections.length) {
    stopFilm(false);
    return;
  }
  sections[filmIndex].scrollIntoView({ behavior: 'smooth' });
  filmTimer = setTimeout(playNextMoment, sceneDurations[filmIndex] || 8000);
  filmIndex += 1;
}
function playFilm() {
  filmActive = true;
  filmIndex = 0;
  body.classList.add('film-mode');
  skipFilm.classList.add('visible');
  if (!soundOn) startSound();
  playNextMoment();
}
function stopFilm(manual = true) {
  filmActive = false;
  clearTimeout(filmTimer);
  body.classList.remove('film-mode');
  skipFilm.classList.remove('visible');
  if (manual && soundOn) stopSound();
}
filmBtn.addEventListener('click', playFilm);
skipFilm.addEventListener('click', () => stopFilm(true));
addEventListener('wheel', () => { if (filmActive) stopFilm(false); }, { passive: true });
addEventListener('touchstart', () => { if (filmActive) stopFilm(false); }, { passive: true });

const cursorOrb = document.getElementById('cursorOrb');
let cursorX = innerWidth / 2;
let cursorY = innerHeight / 2;
let orbX = cursorX;
let orbY = cursorY;
addEventListener('pointermove', (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
}, { passive: true });
function animateCursor() {
  orbX += (cursorX - orbX) * 0.16;
  orbY += (cursorY - orbY) * 0.16;
  cursorOrb.style.left = `${orbX}px`;
  cursorOrb.style.top = `${orbY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();
document.querySelectorAll('a, button').forEach((element) => {
  element.addEventListener('pointerenter', () => cursorOrb.classList.add('is-large'));
  element.addEventListener('pointerleave', () => cursorOrb.classList.remove('is-large'));
});

// Finale typography is choreographed as individual frames rather than one block fade.
function splitCharacters(element, className = 'char') {
  if (!element) return;
  const label = element.textContent;
  element.setAttribute('aria-label', label);
  element.textContent = '';
  [...label].forEach((character, index) => {
    const span = document.createElement('span');
    span.className = `${className}${character === ' ' ? ' char--space' : ''}`;
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--char-index', index);
    span.textContent = character === ' ' ? '\u00a0' : character;
    element.appendChild(span);
  });
}
function splitWords(element) {
  if (!element) return;
  const label = element.textContent.trim();
  element.setAttribute('aria-label', label);
  element.textContent = '';
  label.split(/\s+/).forEach((word, index, words) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--word-index', index);
    span.textContent = word;
    element.appendChild(span);
    if (index < words.length - 1) element.append(' ');
  });
}
splitCharacters(document.querySelector('.finale__small'), 'char char--script');
splitCharacters(document.querySelector('.finale h2 > span'));
splitCharacters(document.querySelector('.finale__image-word'), 'char char--image');
splitWords(document.querySelector('.finale__message'));
