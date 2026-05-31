import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

export function renderSorvete(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha('O que tem nesse pote de sorvete?', 'Selecione a opção e clique em', parent);
  refreshImg.style.display = 'none';

  const container = el('div', 'sorvete-container');
  const card = el('div', 'sorvete-card');
  const img = el('img', 'sorvete-image');
  img.src = 'assets/sorvete/poteFechado.webp';
  img.alt = 'Pote de sorvete';
  card.appendChild(img);
  container.appendChild(card);

  const controls = el('div', 'sorvete-controls');
  const options = ['Feijão', 'Sorvete', 'Arroz', 'Outro Pote'];
  let selected = null;

  options.forEach(opt => {
    const btn = el('button', 'sorvete-choice');
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      SFX.click();
      selected = opt;
      Array.from(controls.querySelectorAll('.sorvete-choice')).forEach(b => b.classList.toggle('selected', b === btn));
    });
    controls.appendChild(btn);
  });

  container.appendChild(controls);
  content.appendChild(container);

  const onVerify = () => {
    if (selected === 'Feijão') {
      SFX.correct();
      img.src = 'assets/sorvete/poteAberto.webp';
      setTimeout(() => onComplete(), 400);
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  };

  verifyBtn.addEventListener('click', onVerify);

  return () => { verifyBtn.removeEventListener('click', onVerify); };
}
