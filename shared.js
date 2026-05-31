// ─── Audio ───────────────────────────────────────────────────────────────────
function playAudio(src, volume = 1) {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
}

export const SFX = {
  click:   () => playAudio('assets/click.mp3', 0.75),
  correct: () => playAudio('assets/correct.mp3', 0.3),
  wrong:   () => playAudio('assets/wrong.mp3', 0.3),
  refresh: () => playAudio('assets/refresh.mp3', 0.3),
};

export function el(tag, cls, attrs = {}) {
  const element = document.createElement(tag);
  if (cls) element.className = cls;
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

export function makeGrid(size, image, parent) {
  const wrap = el('div', 'grid-inner');
  wrap.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  wrap.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  const selected = new Set();
  const items = [];

  for (let i = 0; i < size * size; i++) {
    const cell = el('div', 'grid-item');
    if (image) {
      const cols = size;
      const rows = size;
      const x = 100 * (i % cols) / (cols - 1);
      const y = 100 * Math.floor(i / cols) / (rows - 1);
      cell.style.backgroundImage = `url(${image})`;
      cell.style.backgroundSize = `${100 * cols}% ${100 * rows}%`;
      cell.style.backgroundPosition = `${x}% ${y}%`;
      cell.style.backgroundRepeat = 'no-repeat';
    }
    cell.addEventListener('click', () => {
      SFX.click();
      if (selected.has(i)) {
        selected.delete(i);
        cell.classList.remove('selected');
      } else {
        selected.add(i);
        cell.classList.add('selected');
      }
    });
    items.push(cell);
    wrap.appendChild(cell);
  }

  parent.appendChild(wrap);

  return {
    getSelected: () => [...selected],
    reset: () => {
      selected.clear();
      items.forEach(cell => cell.classList.remove('selected'));
    },
  };
}

function startTimer(timerElement) {
  let time = 20;

  timerElement.textContent = '00:20';

  setInterval(() => {
    time--;

    if (time >= 0) {
      timerElement.textContent = `00:${String(time).padStart(2, '0')}`;
      timerElement.classList.remove('negative');
    } else {
      timerElement.textContent = `00:-${String(Math.abs(time)).padStart(2, '0')}`;
      timerElement.classList.add('negative');
    }
  }, 1000);
}

export function makeGridCaptcha(title, instruction, parent) {
  const container = el('div', 'captcha-container');

  const header = el('div', 'captcha-title');
  header.innerHTML = `${instruction}<div class="captcha-title-type">${title}</div>`;
  container.appendChild(header);

  const content = el('div', 'captcha-content');
  container.appendChild(content);

  const controls = el('div', 'captcha-controls');
  const refreshImg = el('img', 'captcha-refresh', { src: 'assets/refresh.svg', alt: '' });
  const timer = el('span', 'captcha-timer');
  timer.textContent = '00:20';
  startTimer(timer);
  
  const verifyBtn = el('button', 'verify-btn');
  verifyBtn.textContent = 'Verify';
  controls.appendChild(refreshImg);
  controls.appendChild(timer);
  controls.appendChild(verifyBtn);
  container.appendChild(controls);
  parent.appendChild(container);

  return { content, refreshImg, verifyBtn };
}

export function shakeWrong(btn) {
  btn.classList.add('wrong');
  setTimeout(() => {
    btn.classList.remove('wrong');
    localStorage.setItem('not-a-robot-level', '0');
    window.location.reload();
  }, 800);
}