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
const LEVELS = [
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
  { name: 'Certificado de Humanidade', render: renderCertificado },
];

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
  goToLevel(0);
});

// ─── Start ────────────────────────────────────────────────────────────────────
goToLevel(currentLevel);