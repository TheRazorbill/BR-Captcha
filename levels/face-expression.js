import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

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
  await faceapi.nets.faceExpressionNet.loadFromUri(FACE_MODELS_URL);
  loadModels.done = true;
}

export function renderFaceExpression(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Face Expression', 'Abra a câmera, sorria e clique em', parent);
  refreshImg.style.display = 'none';

  const wrap = el('div', 'face-expression');
  const preview = el('div', 'face-expression-preview');
  const video = el('video', 'face-expression-video', {
    autoplay: 'true',
    playsinline: 'true',
    muted: 'true',
  });
  const overlay = el('div', 'face-expression-overlay');
  overlay.textContent = 'Câmera desligada';

  preview.appendChild(video);
  preview.appendChild(overlay);

  const status = el('div', 'face-expression-status');
  status.textContent = 'Permita a câmera para começar.';

  const startBtn = el('button', 'face-expression-start');
  startBtn.textContent = 'Iniciar câmera';

  wrap.appendChild(preview);
  wrap.appendChild(status);
  wrap.appendChild(startBtn);
  content.appendChild(wrap);

  let stream = null;
  let intervalId = null;
  let smiling = false;
  let starting = false;
  let completed = false;

  verifyBtn.disabled = true;

  async function startCamera() {
    if (starting || completed) return;
    starting = true;
    status.textContent = 'Carregando modelos...';

    try {
      const faceapi = await loadFaceApiScript();
      await loadModels(faceapi);

      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      await video.play();
      overlay.textContent = 'Olhe para a câmera';
      status.textContent = 'Agora sorria.';
      startBtn.disabled = true;
      startBtn.textContent = 'Câmera ativa';

      intervalId = window.setInterval(async () => {
        if (completed || video.readyState < 2) return;

        try {
          const detection = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 }))
            .withFaceExpressions();

          if (!detection) {
            smiling = false;
            verifyBtn.disabled = true;
            overlay.textContent = 'Nenhum rosto detectado';
            status.textContent = 'Aproxime o rosto e sorria.';
            return;
          }

          const happyScore = detection.expressions?.happy || 0;
          smiling = happyScore >= 0.8;
          verifyBtn.disabled = !smiling;

          if (smiling) {
            overlay.textContent = 'Sorriso detectado';
            status.textContent = 'Sorria detectado. Clique em Verify para continuar.';
          } else {
            overlay.textContent = 'Quase lá';
            status.textContent = 'Preciso ver um sorriso maior.';
          }
        } catch (error) {
          status.textContent = 'Erro ao analisar o rosto. Tente de novo.';
        }
      }, 350);
    } catch (error) {
      status.textContent = 'Não consegui iniciar a câmera ou carregar os modelos.';
      overlay.textContent = 'Erro';
      startBtn.disabled = false;
      starting = false;
    }
  }

  function verifySmile() {
    if (completed) return;
    if (smiling) {
      completed = true;
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
      status.textContent = 'Você precisa sorrir primeiro.';
    }
  }

  startBtn.addEventListener('click', () => {
    SFX.click();
    startCamera();
  });
  verifyBtn.addEventListener('click', verifySmile);

  return () => {
    if (intervalId) window.clearInterval(intervalId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    verifyBtn.removeEventListener('click', verifySmile);
  };
}