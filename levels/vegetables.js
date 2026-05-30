import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

export function renderVegetables(parent, onComplete) {
  const VEGS = ['tomato', 'carrot', 'onion', 'banana', 'grape', 'corn', 'avocado', 'potato', 'eggplant'];
  const CORRECT = ['carrot', 'onion', 'corn', 'potato'];
  const OPTIONAL = ['eggplant'];

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Vegetais', 'Selecione todos os quadrados com os', parent);

  const gridWrap = el('div', 'grid-inner');
  gridWrap.style.gridTemplateColumns = 'repeat(3, 1fr)';
  gridWrap.style.gridTemplateRows = 'repeat(3, 1fr)';
  const selected = new Set();
  const cells = [];

  VEGS.forEach((veg, i) => {
    const cell = el('div', 'grid-item');
    const img = el('img', 'veg-img', { src: `assets/vegetables/${veg}.webp`, alt: veg });
    cell.appendChild(img);
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
    cells.push(cell);
    gridWrap.appendChild(cell);
  });
  content.appendChild(gridWrap);

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    selected.clear();
    cells.forEach(cell => cell.classList.remove('selected'));
  });

  verifyBtn.addEventListener('click', () => {
    const selNames = [...selected].map(i => VEGS[i]);
    let errors = 0;
    CORRECT.forEach(c => { if (!selNames.includes(c)) errors++; });
    selNames.forEach(s => { if (!CORRECT.includes(s) && !OPTIONAL.includes(s)) errors++; });

    if (errors <= 1) {
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
      selected.clear();
      cells.forEach(cell => cell.classList.remove('selected'));
    }
  });

  return null;
}