import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

export function renderCampainha(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Aguarde ou corra?', 'Selecione a opção correta e clique em', parent);
  refreshImg.style.display = 'none';

  const container = el('div', 'campainha-container');
  const card = el('div', 'campainha-card');
  const image = el('img', 'campainha-image', {
    src: 'assets/campainha/campainha.webp',
    alt: 'Campainha',
  });
  card.appendChild(image);
  container.appendChild(card);

  const controls = el('div', 'campainha-controls');
  const options = [
    { key: 'aguarde', label: 'Aguarde' },
    { key: 'corra', label: 'Corra' },
  ];

  let selected = null;

  options.forEach((option) => {
    const button = el('button', 'campainha-choice');
    button.textContent = option.label;
    button.addEventListener('click', () => {
      SFX.click();
      selected = option.key;
      Array.from(controls.querySelectorAll('.campainha-choice')).forEach((item) => {
        item.classList.toggle('selected', item === button);
      });
    });
    controls.appendChild(button);
  });

  container.appendChild(controls);
  content.appendChild(container);

  const onVerify = () => {
    if (selected === 'corra') {
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  };

  verifyBtn.addEventListener('click', onVerify);

  return () => {
    verifyBtn.removeEventListener('click', onVerify);
  };
}