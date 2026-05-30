import { SFX, el } from '../../shared.js';

function startTimer(timerElement) {
  let time = 20;

  timerElement.textContent = '00:20';

  const interval = setInterval(() => {
    time--;

    if (time >= 0) {
      timerElement.textContent = `00:${String(time).padStart(2, '0')}`;
    } else {
      timerElement.textContent = `00:-${String(Math.abs(time)).padStart(2, '0')}`;
    }
  }, 1000);

  return interval;
}

export function renderCompleteLyrics(parent, onComplete) {
  const CORRECT_ANSWER = 'PROCUREI REMÉDIO NA VIDA NOTURNA';

  // Música
  const music = new Audio('assets/complete-music/boate-azul.mp3');
  music.volume = 0.35;
  music.loop = true;
  music.play().catch(() => {});

  // Timer
  const timer = el('span', 'captcha-timer');
  timer.textContent = '00:20';
  const timerInterval = startTimer(timer);

  // Container principal
  const wrap = el('div', 'word-captcha-wrap');

  const instr = el('div', 'wc-instruction');
  instr.textContent = 'Complete a música abaixo';

  wrap.appendChild(timer);
  wrap.appendChild(instr);

  // Texto da música
  const lyricBox = el('div', 'wc-lyric-box');
  lyricBox.textContent = 'Doente de amor...';
  wrap.appendChild(lyricBox);

  // Input + botão
  const inputRow = el('div', 'wc-input-row');

  const input = el('input', 'wc-input', {
    type: 'text',
    placeholder: 'Digite a continuação',
    autofocus: '',
  });

  const submitBtn = el('button', 'wc-submit');
  submitBtn.textContent = 'Enviar';

  inputRow.appendChild(input);
  inputRow.appendChild(submitBtn);
  wrap.appendChild(inputRow);

  parent.appendChild(wrap);

  function normalizeText(text) {
    return text
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function stopMusic() {
    music.pause();
    music.currentTime = 0;
  }

  function submit() {
    const userAnswer = normalizeText(input.value);
    const correctAnswer = normalizeText(CORRECT_ANSWER);

    if (userAnswer === correctAnswer) {
      stopMusic();
      clearInterval(timerInterval);

      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();

      input.classList.add('wrong');
      submitBtn.classList.add('wrong');

      setTimeout(() => {
        input.classList.remove('wrong');
        submitBtn.classList.remove('wrong');
      }, 800);

      input.value = '';
    }
  }

  submitBtn.addEventListener('click', submit);

  input.addEventListener('keyup', event => {
    if (event.key === 'Enter') submit();
  });

  // Cleanup caso esse captcha seja removido antes de completar
  return () => {
    stopMusic();
    clearInterval(timerInterval);
  };
}