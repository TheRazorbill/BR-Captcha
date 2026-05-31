import { renderCheckbox } from './levels/checkbox.js';
import { renderStopSigns } from './levels/stop-signs.js';
import { renderVegetables } from './levels/vegetables.js';
import { renderRotating } from './levels/rotating.js';
import { renderTicTacToe } from './levels/tic-tac-toe.js';
import { renderWordCaptcha } from './levels/word-captcha.js';
import { renderArrozFeijao } from './levels/arroz-feijao.js';
import { renderCompleteLyrics } from './levels/complete-song/index.js';
import { renderMeiaTenis } from './levels/meia-tenis.js';
import { renderSorvete } from './levels/sorvete/index.js';
import { renderCampainha } from './levels/campainha/campainha.js';
import { renderCpfNaNota } from './levels/cpf-na-nota/index.js';
import { renderFaceExpression } from './levels/face-expression.js';
import { renderConserteChinelo } from './levels/conserte-chinelo/index.js';

// ─── State ───────────────────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Checkbox',    render: renderCheckbox },
  { name: 'Pote de Sorvete', render: renderSorvete },
  { name: 'Conserte o Chinelo', render: renderConserteChinelo },
  { name: 'Stop Sign',   render: renderStopSigns },
  { name: 'Vegetable',   render: renderVegetables },
  { name: 'Rotation',    render: renderRotating },
  { name: 'Tic Tac Toe', render: renderTicTacToe },
  { name: 'Word Captcha',render: renderWordCaptcha },
  { name: 'Arroz e Feijão', render: renderArrozFeijao },
  { name: 'Complete a Música', render: renderCompleteLyrics },
  { name: 'Campainha', render: renderCampainha },
  { name: 'Meia / Tênis', render: renderMeiaTenis },
  { name: 'CPF na Nota', render: renderCpfNaNota },  
  { name: 'Face Expression', render: renderFaceExpression },
];

let currentLevel = parseInt(localStorage.getItem('not-a-robot-level') || '0');
let cleanup = null;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $content    = document.getElementById('content');
const $levelLabel = document.getElementById('header-level');
const $resetBtn   = document.getElementById('footer-reset');
const $modalOverlay = document.getElementById('modal-overlay');
const $modalBtnCancel = document.getElementById('modal-cancel');
const $modalBtnReset  = document.getElementById('modal-reset');

// ─── Navigation ──────────────────────────────────────────────────────────────
function goToLevel(n) {
  if (cleanup) { cleanup(); cleanup = null; }
  currentLevel = Math.max(0, Math.min(n, LEVELS.length - 1));
  localStorage.setItem('not-a-robot-level', currentLevel);
  $levelLabel.textContent = `Level ${currentLevel + 1}: ${LEVELS[currentLevel].name}`;
  $content.innerHTML = '';
  cleanup = LEVELS[currentLevel].render($content, () => {
    const nextLevelIndex = currentLevel + 1;
    if (nextLevelIndex < LEVELS.length) {
      setTimeout(() => goToLevel(nextLevelIndex), 800);
    }
  });
}

function nextLevel() { goToLevel(currentLevel + 1); }

// ─── Reset modal ─────────────────────────────────────────────────────────────
$resetBtn.addEventListener('click', () => $modalOverlay.classList.add('visible'));
$modalBtnCancel.addEventListener('click', () => $modalOverlay.classList.remove('visible'));
$modalBtnReset.addEventListener('click', () => {
  $modalOverlay.classList.remove('visible');
  goToLevel(0);
});

// ─── Start ────────────────────────────────────────────────────────────────────
goToLevel(currentLevel);