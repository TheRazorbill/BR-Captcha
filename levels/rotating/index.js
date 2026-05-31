import { SFX, el, makeGridCaptcha, shakeWrong } from '../../shared.js';

export function renderRotating(parent, onComplete) {
  const rotations = Array.from({ length: 9 }, () => 90 * Math.floor(4 * Math.random()));

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Interseção', 'Remontar a', parent);
  refreshImg.style.display = 'none';

  const rotateCont = el('div', 'rotating-container');

  function getPos(i) {
    const x = 100 * (i % 3) / 2;
    const y = 100 * Math.floor(i / 3) / 2;
    return `${x}% ${y}%`;
  }

  const items = rotations.map((rot, i) => {
    const div = el('div', 'rotating-item');
    div.style.backgroundPosition = getPos(i);
    div.style.transform = `rotate(${rot}deg)`;
    div.addEventListener('click', () => {
      SFX.click();
      rotations[i] = (rotations[i] + 90) % 360;
      div.style.transform = `rotate(${rotations[i]}deg)`;
    });
    rotateCont.appendChild(div);
    return div;
  });
  content.appendChild(rotateCont);

  function shuffle() {
    rotations.forEach((_, i) => {
      rotations[i] = 90 * Math.floor(4 * Math.random());
      items[i].style.transform = `rotate(${rotations[i]}deg)`;
    });
  }

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    shuffle();
  });

  verifyBtn.addEventListener('click', () => {
    if (rotations.every(r => r % 360 === 0)) {
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  });

  return null;
}
