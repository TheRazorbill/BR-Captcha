import { SFX, el, makeGridCaptcha, shakeWrong } from '../../shared.js';

export function renderSorvete(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha(
    'O que tem nesse pote de sorvete congelado?',
    'Digite a resposta',
    parent
  );

  refreshImg.style.display = 'none';
  verifyBtn.style.display = 'none';

  const container = el('div', 'sorvete-container');

  const card = el('div', 'sorvete-card');

  const img = el('img', 'sorvete-image');
  img.src = 'assets/sorvete/poteFechado.webp';
  img.alt = 'Pote de sorvete';

  card.appendChild(img);
  container.appendChild(card);

  const inputRow = el('div', 'sorvete-input-row');

  const input = el('input', 'sorvete-input', {
    type: 'text',
    placeholder: 'Resposta',
    autofocus: '',
  });

  const submitBtn = el('button', 'sorvete-submit');
  submitBtn.textContent = 'Verificar';

  inputRow.appendChild(input);
  inputRow.appendChild(submitBtn);
  container.appendChild(inputRow);

  content.appendChild(container);

  function normalizeAnswer(value) {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function submit() {
    const answer = normalizeAnswer(input.value);

    if (answer === 'feijao') {
      SFX.correct();
      img.src = 'assets/sorvete/poteAberto.webp';

      input.disabled = true;
      submitBtn.disabled = true;

      setTimeout(() => onComplete(), 400);
    } else {
      SFX.wrong();

      input.classList.add('wrong');
      submitBtn.classList.add('wrong');

      shakeWrong(submitBtn);

      input.value = '';
      input.focus();

      setTimeout(() => {
        input.classList.remove('wrong');
        submitBtn.classList.remove('wrong');
      }, 500);
    }
  }

  submitBtn.addEventListener('click', submit);

  input.addEventListener('keyup', event => {
    if (event.key === 'Enter') submit();
  });

  return () => {
    submitBtn.removeEventListener('click', submit);
  };
}