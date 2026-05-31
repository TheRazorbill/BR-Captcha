import { SFX, el, makeGridCaptcha, shakeWrong } from '../../shared.js';

const FACE_API_SCRIPT = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
const FACE_MODELS_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let faceApiScriptPromise = null;

function loadFaceApiScript() {
  if (window.faceapi) return Promise.resolve(window.faceapi);

  if (!faceApiScriptPromise) {
    faceApiScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = FACE_API_SCRIPT;
      script.async = true;
      script.onload = () => resolve(window.faceapi);
      script.onerror = () => reject(new Error('Não foi possível carregar a Face API.'));
      document.head.appendChild(script);
    });
  }

  return faceApiScriptPromise;
}

async function loadModels(faceapi) {
  if (loadModels.done) return;

  await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODELS_URL);

  loadModels.done = true;
}

function playDingDong() {
  const audio = new Audio('assets/campainha/ding-dong.mp3');
  audio.play().catch(() => {
    console.log('O navegador bloqueou o som.');
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function renderCampainha(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha(
    'Aperte a campainha e se esconda',
    'Seja rápido, a dona da casa está chegando!',
    parent
  );

  refreshImg.style.display = 'none';
  verifyBtn.disabled = true;

  const wrap = el('div', 'campainha-captcha');

  const preview = el('div', 'campainha-preview');

  const video = el('video', 'campainha-video', {
    autoplay: 'true',
    playsinline: 'true',
    muted: 'true',
  });

  const canvas = el('canvas', 'campainha-snapshot');
  canvas.style.display = 'none';

  const overlay = el('div', 'campainha-overlay');
  overlay.textContent = 'Câmera desligada';

  preview.appendChild(video);
  preview.appendChild(canvas);
  preview.appendChild(overlay);

  const campainhaArea = el('div', 'campainha-area');

  const campainhaBtn = el('button', 'campainha-btn', {
    type: 'button',
    'aria-label': 'Apertar campainha',
  });

  const campainhaImg = el('img', 'campainha-img', {
    src: 'assets/campainha/campainha.jpg',
    alt: 'Campainha',
  });

  campainhaBtn.appendChild(campainhaImg);
  campainhaArea.appendChild(campainhaBtn);

  const timer = el('div', 'campainha-timer');
  timer.textContent = '';

  const status = el('div', 'campainha-status');
  status.textContent = 'Permita a câmera para começar.';

  const startBtn = el('button', 'campainha-start');
  startBtn.textContent = 'Iniciar câmera';

  wrap.appendChild(preview);
  wrap.appendChild(timer);
  wrap.appendChild(status);
  wrap.appendChild(startBtn);
  wrap.appendChild(campainhaArea);

  content.appendChild(wrap);

  let stream = null;
  let starting = false;
  let cameraReady = false;
  let completed = false;
  let running = false;
  let hiddenSuccessfully = false;

  campainhaBtn.disabled = true;

  async function startCamera() {
    if (starting || completed) return;

    starting = true;
    status.textContent = 'Carregando detector de fofoqueiro...';

    try {
      const faceapi = await loadFaceApiScript();
      await loadModels(faceapi);

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      video.srcObject = stream;
      await video.play();

      cameraReady = true;

      video.style.display = 'block';
      canvas.style.display = 'none';

      overlay.textContent = 'Olhe para a câmera';
      status.textContent = 'Pronto. Aperte a campainha e se esconda em 3 segundos.';

      startBtn.disabled = true;
      startBtn.textContent = 'Câmera ativa';

      campainhaBtn.disabled = false;
    } catch (error) {
      console.error(error);

      status.textContent = 'Não consegui iniciar a câmera ou carregar os modelos.';
      overlay.textContent = 'Erro';

      startBtn.disabled = false;
      starting = false;
      campainhaBtn.disabled = true;
    }
  }

  async function countdown() {
    for (let i = 3; i > 0; i--) {
      timer.textContent = i;
      overlay.textContent = 'CORRE!';
      status.textContent = 'Se esconda antes da dona da casa aparecer!';
      await wait(1000);
    }

    timer.textContent = '';
  }

  function takeSnapshot() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    video.style.display = 'none';
    canvas.style.display = 'block';
  }

  async function detectFaces() {
    const faceapi = window.faceapi;

    const detections = await faceapi.detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.5,
      })
    );

    return detections;
  }

  function stopCamera() {
    if (!stream) return;

    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const successMessages = [
    'Fuga aprovada. Nenhum rosto detectado.',
    'Instinto brasileiro confirmado.',
    'A dona Maria abriu a janela e não viu ninguém.',
  ];

  const failMessages = [
    'Você ficou encarando a consequência dos seus atos.',
    'A dona da casa viu sua cara pela janela.',
    'Você apertou a campainha e não correu. Muito suspeito.',
    'Face detectada. O cachorro caramelo já decorou seu rosto.',
    'A vizinhança inteira já sabe que foi você.',
  ];

  async function handleCampainhaClick() {
    if (completed || running) return;

    if (!cameraReady) {
      SFX.wrong();
      shakeWrong(campainhaBtn);
      status.textContent = 'Você precisa iniciar a câmera primeiro.';
      return;
    }

    running = true;
    hiddenSuccessfully = false;
    verifyBtn.disabled = true;
    campainhaBtn.disabled = true;

    video.style.display = 'block';
    canvas.style.display = 'none';

    SFX.click();
    playDingDong();

    overlay.textContent = 'DING DONG!';
    status.textContent = 'Você apertou a campainha. Agora corre!';
    campainhaBtn.classList.add('campainha-pressed');

    await wait(600);

    await countdown();

    status.textContent = 'Foto tirada. Verificando se você se escondeu...';
    overlay.textContent = 'Analisando esconderijo...';

    takeSnapshot();

    try {
      const faces = await detectFaces();

      if (faces.length === 0) {
        SFX.correct();

        hiddenSuccessfully = true;
        running = false;

        overlay.textContent = 'Ninguém encontrado';
        status.textContent = `✅ ${getRandomMessage(successMessages)} Clique em Verify para continuar.`;

        verifyBtn.disabled = false;
        campainhaBtn.disabled = true;
      } else {
        SFX.wrong();
        shakeWrong(campainhaBtn);

        hiddenSuccessfully = false;
        verifyBtn.disabled = true;

        overlay.textContent = 'Rosto detectado';
        status.textContent = `❌ ${getRandomMessage(failMessages)}`;

        campainhaBtn.disabled = false;
        campainhaBtn.classList.remove('campainha-pressed');
        running = false;
      }
    } catch (error) {
      console.error(error);

      SFX.wrong();
      shakeWrong(campainhaBtn);

      hiddenSuccessfully = false;
      verifyBtn.disabled = true;

      overlay.textContent = 'Erro';
      status.textContent = 'Erro ao analisar a imagem. Tente de novo.';

      campainhaBtn.disabled = false;
      campainhaBtn.classList.remove('campainha-pressed');
      running = false;
    }
  }

  function verifyCampainha() {
    if (completed) return;

    if (hiddenSuccessfully) {
      completed = true;
      SFX.correct();
      stopCamera();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
      status.textContent = 'Você precisa apertar a campainha e se esconder primeiro.';
    }
  }

  function handleStartClick() {
    SFX.click();
    startCamera();
  }

  startBtn.addEventListener('click', handleStartClick);
  campainhaBtn.addEventListener('click', handleCampainhaClick);
  verifyBtn.addEventListener('click', verifyCampainha);

  return () => {
    stopCamera();

    startBtn.removeEventListener('click', handleStartClick);
    campainhaBtn.removeEventListener('click', handleCampainhaClick);
    verifyBtn.removeEventListener('click', verifyCampainha);
  };
}