import { renderCheckbox } from './levels/checkbox/index.js';
import { renderCampainha } from './levels/campainha/index.js';
import { renderSorvete } from './levels/sorvete/index.js';
import { renderConserteChinelo } from './levels/conserte-chinelo/index.js';
import { renderStopSigns } from './levels/stop-signs/index.js';
import { renderVegetables } from './levels/vegetables/index.js';
import { renderRotating } from './levels/rotating/index.js';
import { renderTicTacToe } from './levels/tic-tac-toe/index.js';
import { renderWordCaptcha } from './levels/word-captcha/index.js';
import { renderArrozFeijao } from './levels/arroz-feijao/index.js';
import { renderCompleteLyrics } from './levels/complete-song/index.js';
import { renderMeiaTenis } from './levels/meia-tenis/index.js';
import { renderCpfNaNota } from './levels/cpf-na-nota/index.js';
import { renderFaceExpression } from './levels/face-expression/index.js';
import { renderCertificado } from './levels/certificado/index.js';

// ─── State ───────────────────────────────────────────────────────────────────
const PLAYABLE_LEVELS = [
  { name: 'Confirme',              render: renderCheckbox },
  { name: 'Campainha',             render: renderCampainha },
  { name: 'Pote de Sorvete',       render: renderSorvete },
  { name: 'Conserte o Chinelo',    render: renderConserteChinelo },
  { name: 'PARE',                  render: renderStopSigns },
  { name: 'Vegetais',              render: renderVegetables },
  { name: 'Interseção',            render: renderRotating },
  { name: 'Jogo da Velha',         render: renderTicTacToe },
  { name: 'Captcha de palavra',    render: renderWordCaptcha },
  { name: 'Arroz e Feijão',        render: renderArrozFeijao },
  { name: 'Complete a Música',     render: renderCompleteLyrics },
  { name: 'Qual a ordem?',         render: renderMeiaTenis },
  { name: 'CPF na Notaaaaa',       render: renderCpfNaNota },
  { name: 'Sorria :)',             render: renderFaceExpression },
];

const CERTIFICATE_LEVEL = { name: 'Certificado de Humanidade', render: renderCertificado };

let LEVELS = [];

function initializeLevels() {
  let levelOrder = null;
  try {
    levelOrder = JSON.parse(localStorage.getItem('not-a-robot-order'));
  } catch (e) {}

  if (!levelOrder || levelOrder.length !== PLAYABLE_LEVELS.length) {
    levelOrder = Array.from({ length: PLAYABLE_LEVELS.length }, (_, i) => i);
    for (let i = levelOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [levelOrder[i], levelOrder[j]] = [levelOrder[j], levelOrder[i]];
    }
    localStorage.setItem('not-a-robot-order', JSON.stringify(levelOrder));
  }

  LEVELS = levelOrder.map(index => PLAYABLE_LEVELS[index]);
  LEVELS.push(CERTIFICATE_LEVEL);
}

initializeLevels();

let currentLevel = parseInt(localStorage.getItem('not-a-robot-level') || '0');
let cleanup = null;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $content      = document.getElementById('content');
const $levelLabel   = document.getElementById('header-level');
const $resetBtn     = document.getElementById('footer-reset');
const $modalOverlay = document.getElementById('modal-overlay');
const $modalBtnCancel = document.getElementById('modal-cancel');
const $modalBtnReset  = document.getElementById('modal-reset');

// ─── Navigation ──────────────────────────────────────────────────────────────
function goToLevel(n) {
  if (cleanup) { cleanup(); cleanup = null; }
  currentLevel = Math.max(0, Math.min(n, LEVELS.length - 1));
  localStorage.setItem('not-a-robot-level', currentLevel);
  if (currentLevel === LEVELS.length - 1) {
    $levelLabel.textContent = LEVELS[currentLevel].name;
  } else {
    $levelLabel.textContent = `Nível ${currentLevel + 1}: ${LEVELS[currentLevel].name}`;
  }
  $content.innerHTML = '';
  cleanup = LEVELS[currentLevel].render($content, () => {
    const nextLevelIndex = currentLevel + 1;
    if (nextLevelIndex < LEVELS.length) {
      setTimeout(() => goToLevel(nextLevelIndex), 800);
    }
  });
}

// ─── Reset modal ─────────────────────────────────────────────────────────────
$resetBtn.addEventListener('click', () => $modalOverlay.classList.add('visible'));
$modalBtnCancel.addEventListener('click', () => $modalOverlay.classList.remove('visible'));
$modalBtnReset.addEventListener('click', () => {
  $modalOverlay.classList.remove('visible');
  localStorage.removeItem('not-a-robot-order');
  initializeLevels();
  goToLevel(0);
});

// ─── Absurd Countdown ────────────────────────────────────────────────────────
function startAbsurdCountdown() {
  const $countdown = document.getElementById('absurd-countdown');
  if (!$countdown) return;

  const targetDate = new Date(3000, 0, 1).getTime();

  setInterval(() => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      $countdown.textContent = 'Tempo esgotado';
      return;
    }

    const secondsInMs = 1000;
    const minutesInMs = secondsInMs * 60;
    const hoursInMs = minutesInMs * 60;
    const daysInMs = hoursInMs * 24;
    const yearsInMs = daysInMs * 365.25;

    const years = Math.floor(difference / yearsInMs);
    const days = Math.floor((difference % yearsInMs) / daysInMs);
    const hours = Math.floor((difference % daysInMs) / hoursInMs);
    const minutes = Math.floor((difference % hoursInMs) / minutesInMs);
    const seconds = Math.floor((difference % minutesInMs) / secondsInMs);

    $countdown.textContent = `Tempo restante para o Vasco ser campeao mundial: ${years}a ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}

// ─── Start ────────────────────────────────────────────────────────────────────
startAbsurdCountdown();
goToLevel(currentLevel);