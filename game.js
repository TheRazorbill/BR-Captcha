import { renderCheckbox } from './levels/checkbox.js';
import { renderStopSigns } from './levels/stop-signs.js';
import { renderVegetables } from './levels/vegetables.js';
import { renderRotating } from './levels/rotating.js';
import { renderTicTacToe } from './levels/tic-tac-toe.js';
import { renderWordCaptcha } from './levels/word-captcha.js';
import { renderArrozFeijao } from './levels/arroz-feijao.js';
import { renderMeiaTenis } from './levels/meia-tenis.js';
import { renderSorvete } from './levels/sorvete.js';

// ─── State ───────────────────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Checkbox',    render: renderCheckbox },
  { name: 'Stop Sign',   render: renderStopSigns },
  { name: 'Vegetable',   render: renderVegetables },
  { name: 'Rotation',    render: renderRotating },
  { name: 'Tic Tac Toe', render: renderTicTacToe },
  { name: 'Word Captcha',render: renderWordCaptcha },
  { name: 'Arroz e Feijão', render: renderArrozFeijao },
  { name: 'Meia / Tênis', render: renderMeiaTenis },
  { name: 'Pote de Sorvete', render: renderSorvete },
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
    setTimeout(() => goToLevel(currentLevel + 1), 800);
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