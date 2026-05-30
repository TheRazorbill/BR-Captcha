import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

export function renderArrozFeijao(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Arroz e Feijão', 'Selecione o lado correto e depois clique em', parent);
  refreshImg.style.display = 'none';

  const instruction = el('div', 'arroz-feijao-instruction');
  content.appendChild(instruction);

  const imageCard = el('div', 'arroz-feijao-card');
  const image = el('img', 'arroz-feijao-image', {
    src: 'assets/arrozFeijao/feijaoDoLado.webp',
    alt: 'Arroz e feijão',
  });
  imageCard.appendChild(image);
  content.appendChild(imageCard);

  const controls = el('div', 'arroz-feijao-controls');
  const leftBtn = el('button', 'arroz-feijao-choice');
  leftBtn.textContent = 'Esquerda';
  const rightBtn = el('button', 'arroz-feijao-choice');
  rightBtn.textContent = 'Direita';
  controls.appendChild(leftBtn);
  controls.appendChild(rightBtn);
  content.appendChild(controls);

  let selected = null;
  let done = false;
  function setSelected(nextSelected) {
    selected = nextSelected;
    leftBtn.classList.toggle('selected', selected === 'left');
    rightBtn.classList.toggle('selected', selected === 'right');
  }

  function handleChoice(nextSelected) {
    if (done) return;
    setSelected(nextSelected);
  }

  function verifySelection() {
    if (done) return;
    if (selected === 'right') {
      done = true;
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  }

  leftBtn.addEventListener('click', () => handleChoice('left'));
  rightBtn.addEventListener('click', () => handleChoice('right'));
  verifyBtn.addEventListener('click', verifySelection);

  return null;
}