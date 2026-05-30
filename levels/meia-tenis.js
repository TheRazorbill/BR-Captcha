import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

export function renderMeiaTenis(parent, onComplete) {
  // Use a grid split into 2 rows (top half, bottom half)
  const { content, refreshImg, verifyBtn } = makeGridCaptcha('qual a ordem correta', 'Selecione a metade correta e depois clique em', parent);
  refreshImg.style.display = 'none';

  const instruction = el('div', 'meia-instruction');
  content.appendChild(instruction);

  const gridWrap = el('div', 'meia-grid');
  gridWrap.style.display = 'grid';
  gridWrap.style.gridTemplateColumns = '1fr';
  gridWrap.style.gridTemplateRows = 'repeat(2, 1fr)';
  gridWrap.style.gap = '6px';

  const rows = 2;
  const cols = 1;
  const items = [];
  const selected = new Set();

  for (let i = 0; i < rows; i++) {
    const cell = el('div', 'meia-cell');
    const x = 50; // center horizontally
    const y = 100 * i / (rows - 1);
    cell.style.backgroundImage = `url(assets/meias/meia.webp)`;
    cell.style.backgroundSize = `${100 * cols}% ${100 * rows}%`;
    cell.style.backgroundPosition = `${x}% ${y}%`;
    cell.style.backgroundRepeat = 'no-repeat';
    cell.addEventListener('click', () => {
      SFX.click();
      selected.clear();
      selected.add(i);
      items.forEach((c, idx) => c.classList.toggle('selected', idx === i));
    });
    items.push(cell);
    gridWrap.appendChild(cell);
  }

  content.appendChild(gridWrap);

  verifyBtn.addEventListener('click', () => {
    const sel = [...selected][0];
    // per spec, the top half (index 0) is correct
    if (sel === 0) { SFX.correct(); onComplete(); }
    else { SFX.wrong(); shakeWrong(verifyBtn); }
  });

  return null;
}