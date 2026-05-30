import { SFX, el } from '../shared.js';

export function renderCheckbox(parent, onComplete) {
  const wrap = el('div', '');
  wrap.id = 'recaptcha-wrap';

  const box = el('div', 'recaptcha-box');

  const cbWrap = el('div', 'cb-wrapper');
  const cbInput = el('div', 'cb-input');
  const spinnerWrap = el('div', 'cb-spinner-wrap');
  spinnerWrap.style.display = 'none';
  const spinner = el('div', 'cb-spinner');
  const overlay = el('div', 'cb-spinner-overlay');
  spinner.appendChild(overlay);
  spinnerWrap.appendChild(spinner);

  const checkmark = el('div', '');
  checkmark.style.display = 'none';
  checkmark.innerHTML = `
    <svg class="cb-checkmark check" width="100" height="100" viewBox="0 0 100 100">
      <path d="M20 55 L40 75 L80 30" fill="none" stroke="green" stroke-width="7"
        stroke-dasharray="100" stroke-dashoffset="100">
        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="0.4s" fill="freeze" begin="0s"/>
      </path>
    </svg>`;

  cbWrap.appendChild(cbInput);
  cbWrap.appendChild(spinnerWrap);
  cbWrap.appendChild(checkmark);

  const text = el('div', 'cb-text');
  text.textContent = 'Não sou um robô';

  const logoArea = el('div', 'cb-logo-area');
  logoArea.innerHTML = `<img src="assets/recaptcha.png" alt="reCAPTCHA"><div class="cb-logo-text">reCAPTCHA</div>`;

  box.appendChild(cbWrap);
  box.appendChild(text);
  box.appendChild(logoArea);
  wrap.appendChild(box);
  parent.appendChild(wrap);

  let done = false;
  box.addEventListener('click', () => {
    if (done) return;
    done = true;
    SFX.click();
    cbInput.classList.add('checked');
    spinnerWrap.style.display = 'block';

    setTimeout(() => {
      spinnerWrap.style.display = 'none';
      checkmark.style.display = 'block';
      SFX.correct();
    }, 700);

    setTimeout(() => onComplete(), 1600);
  });

  return null;
}