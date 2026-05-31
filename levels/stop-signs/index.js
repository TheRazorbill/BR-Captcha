import { SFX, makeGrid, makeGridCaptcha, shakeWrong } from '../../shared.js';

export function renderStopSigns(parent, onComplete) {
  const CORRECT = [
    [2, 3, 6, 7],
    [0, 1, 2, 4, 5, 6, 8, 9, 10],
    [1, 2, 3, 5, 6, 7, 9, 10, 11],
    [0, 1, 2, 4, 5, 6],
  ];
  let idx = 0;

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Sinal de PARE', 'Selecione todos os quadrados com o', parent);
  refreshImg.style.display = 'none';
  let grid = makeGrid(4, `assets/stop-signs/pare.jpg`, content);

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    idx = (idx + 1) % 4;
    content.innerHTML = '';
    grid = makeGrid(4, `assets/stop-signs/pare.jpg`, content);
  });

  verifyBtn.addEventListener('click', () => {
    const sel = grid.getSelected();
    const correct = CORRECT[idx];
    const ok = sel.length === correct.length && sel.every(i => correct.includes(i));
    if (ok) {
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
      grid.reset();
    }
  });

  return null;
}
