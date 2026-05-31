import { SFX, el } from '../../shared.js';

function startTimer(timerElement) {
  let time = 20;

  timerElement.textContent = '00:20';

  const interval = setInterval(() => {
    time--;

    if (time >= 0) {
      timerElement.textContent = `00:${String(time).padStart(2, '0')}`;
    } else {
      timerElement.textContent = `00:-${String(Math.abs(time)).padStart(2, '0')}`;
    }
  }, 1000);

  return interval;
}

export function renderCpfNaNota(parent, onComplete) {
  const wrap = el('div', 'word-captcha-wrap');

  const timer = el('span', 'captcha-timer');
  const timerInterval = startTimer(timer);
  wrap.appendChild(timer);

  const instr = el('div', 'wc-instruction');
  instr.textContent = 'Grite para continuar';
  wrap.appendChild(instr);

  const phrase = el('div', 'cpf-phrase');
  phrase.textContent = 'CPF NA NOTA?';
  wrap.appendChild(phrase);

  const status = el('div', 'cpf-status');
  status.textContent = 'Clique no botão e grite CPF NA NOTAAAAAAAAAA?';
  wrap.appendChild(status);

  const volumeBox = el('div', 'cpf-volume-box');

  const volumeBar = el('div', 'cpf-volume-bar');
  volumeBox.appendChild(volumeBar);

  wrap.appendChild(volumeBox);

  const progressText = el('div', 'cpf-progress');
  progressText.textContent = 'Intensidade do CPF: 0%';
  wrap.appendChild(progressText);

  const controls = el('div', 'wc-input-row');

  const micBtn = el('button', 'wc-submit');
  micBtn.textContent = 'Gritar';

  const verifyBtn = el('button', 'wc-submit');
  verifyBtn.textContent = 'Verify';
  verifyBtn.disabled = true;

  controls.appendChild(micBtn);
  controls.appendChild(verifyBtn);
  wrap.appendChild(controls);

  parent.appendChild(wrap);

  let audioContext = null;
  let analyser = null;
  let microphone = null;
  let stream = null;
  let animationId = null;
  let passed = false;

  async function startListening() {
    try {
      SFX.click();

      status.textContent = 'Pedindo acesso ao microfone...';
      progressText.textContent = 'Intensidade do CPF: 0%';
      volumeBar.style.width = '0%';

      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();

      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let loudTime = 0;
      let lastFrameTime = performance.now();

      const REQUIRED_LOUD_TIME = 1500; // precisa gritar por 1.5s
      const VOLUME_THRESHOLD = 35; // aumenta se estiver fácil demais

      micBtn.disabled = true;
      micBtn.textContent = 'Ouvindo...';
      status.textContent = 'Agora grite: CPF NA NOTAAAAAAA?';

      function detectVolume() {
        analyser.getByteFrequencyData(dataArray);

        const now = performance.now();
        const deltaTime = now - lastFrameTime;
        lastFrameTime = now;

        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        const volumePercent = Math.min(100, average * 2);
        volumeBar.style.width = `${volumePercent}%`;

        if (average > VOLUME_THRESHOLD) {
          loudTime += deltaTime;

          const progress = Math.min(
            100,
            Math.floor((loudTime / REQUIRED_LOUD_TIME) * 100)
          );

          status.textContent = 'Continue gritando...';
          progressText.textContent = `Intensidade do CPF: ${progress}%`;
        } else {
          loudTime = Math.max(0, loudTime - deltaTime * 0.8);

          const progress = Math.min(
            100,
            Math.floor((loudTime / REQUIRED_LOUD_TIME) * 100)
          );

          status.textContent = 'Volume insuficiente. Grite: CPF NA NOTAAAAAAA?';
          progressText.textContent = `Intensidade do CPF: ${progress}%`;
        }

        if (loudTime >= REQUIRED_LOUD_TIME) {
          passed = true;
          verifyBtn.disabled = false;

          status.textContent = 'CPF sustentado detectado.';
          progressText.textContent = 'Intensidade do CPF: 100%';

          SFX.correct();
          stopListening(false);
          return;
        }

        animationId = requestAnimationFrame(detectVolume);
      }

      detectVolume();
    } catch (error) {
      console.error(error);

      status.textContent =
        'Não consegui acessar o microfone. Permita o acesso no navegador.';

      SFX.wrong();
    }
  }

  function stopListening(stopStream = true) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (stopStream && stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    micBtn.disabled = false;
    micBtn.textContent = '🎤 Gritar de novo';
  }

  micBtn.addEventListener('click', startListening);

  verifyBtn.addEventListener('click', () => {
    if (!passed) {
      SFX.wrong();

      verifyBtn.classList.add('wrong');

      setTimeout(() => {
        verifyBtn.classList.remove('wrong');
      }, 800);

      return;
    }

    clearInterval(timerInterval);
    stopListening(true);

    SFX.correct();
    onComplete();
  });

  return () => {
    clearInterval(timerInterval);
    stopListening(true);
  };
}