import { SFX, el, makeGridCaptcha, shakeWrong } from '../../shared.js';

export function renderCertificado(parent, onComplete) {
  const { content, refreshImg, verifyBtn } = makeGridCaptcha(
    'Assine o seu Certificado de Humanidade',
    'Preencha o seu nome',
    parent
  );

  refreshImg.style.display = 'none';
  verifyBtn.disabled = true;

  const container = el('div', 'cert-container');

  const instructions = el('div', 'cert-instructions');
  instructions.innerHTML = 'Para obter o seu certificado oficial, digite o seu <strong>nome completo</strong> no campo abaixo. Os campos do certificado serão preenchidos automaticamente!';

  const inputArea = el('div', 'cert-input-area');
  
  const nameInput = el('input', 'cert-name-input', {
    type: 'text',
    placeholder: 'Digite seu nome completo...',
    maxlength: '36',
    autocomplete: 'off'
  });

  inputArea.appendChild(nameInput);

  const certBoard = el('div', 'cert-board');

  const bgImg = el('img', 'cert-bg-img', {
    src: 'assets/certificado.png',
    alt: 'Certificado de Humanidade'
  });
  
  certBoard.appendChild(bgImg);

  const dropZonesData = [
    { id: 'box', top: '37.9%', left: '22.5%', width: '55%', height: '10.5%' },
    { id: 'line', top: '55.9%', left: '34.35%', width: '13.8%', height: '4.2%' },
    { id: 'signature', top: '72.4%', left: '61%', width: '23%', height: '5.2%' }
  ];

  const dropZones = dropZonesData.map(data => {
    const zoneEl = el('div', 'cert-drop-zone', { 'data-zone': data.id });
    zoneEl.style.top = data.top;
    zoneEl.style.left = data.left;
    zoneEl.style.width = data.width;
    zoneEl.style.height = data.height;

    const valueDiv = el('div', 'cert-drop-zone-value');
    zoneEl.appendChild(valueDiv);
    certBoard.appendChild(zoneEl);

    return {
      id: data.id,
      el: zoneEl,
      valueDiv: valueDiv
    };
  });

  container.appendChild(instructions);
  container.appendChild(inputArea);
  container.appendChild(certBoard);
  content.appendChild(container);

  nameInput.addEventListener('input', () => {
    const fullName = nameInput.value;
    const trimmed = fullName.trim();

    const parts = trimmed.split(/\s+/);
    const firstName = parts[0] || '';

    dropZones.forEach(zone => {
      const displayValue = zone.id === 'box' ? fullName : firstName;
      zone.valueDiv.textContent = displayValue;
      if (trimmed) {
        zone.el.classList.add('filled');
      } else {
        zone.el.classList.remove('filled');
      }
    });

    verifyBtn.disabled = !trimmed;
  });

  function showVictoryScreen(name) {
    const header = document.getElementById('header');
    if (header) header.style.display = 'none';

    const footer = document.getElementById('footer');
    if (footer) footer.style.display = 'none';

    const captchaContainer = parent.querySelector('.captcha-container');
    if (captchaContainer) {
      captchaContainer.innerHTML = '';
      captchaContainer.classList.add('cert-captcha-victory');
    }

    const successView = el('div', 'cert-success-view');

    const successTitle = el('h2', 'cert-success-title');
    successTitle.textContent = 'VOCÊ PROVOU QUE É HUMANO!';

    const successText = el('p', 'cert-success-text');
    successText.textContent = `Parabéns, ${name}! Você completou todas as 14 etapas do BR-Captcha. Baixe seu certificado de humanidade abaixo!`;

    const finalCertBoard = certBoard.cloneNode(true);
    finalCertBoard.querySelectorAll('.cert-drop-zone').forEach(el => {
      el.classList.add('filled');
    });

    const userPhotoDataUrl = localStorage.getItem('br-captcha-user-photo');
    if (userPhotoDataUrl) {
      const userPhotoImg = el('img', 'cert-user-photo', {
        src: userPhotoDataUrl,
        alt: 'Sua foto sorrindo'
      });
      finalCertBoard.appendChild(userPhotoImg);
    }

    const downloadBtn = el('button', 'cert-download-btn');
    downloadBtn.innerHTML = 'Baixar Certificado Oficial';

    downloadBtn.addEventListener('click', () => {
      SFX.correct();
      downloadCertificate(name);
    });

    successView.appendChild(successTitle);
    successView.appendChild(successText);
    successView.appendChild(finalCertBoard);
    successView.appendChild(downloadBtn);

    if (captchaContainer) {
      captchaContainer.appendChild(successView);
    } else {
      content.appendChild(successView);
    }

    triggerConfetti();
  }

  function downloadCertificate(fullName) {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1414;
    const ctx = canvas.getContext('2d');
    
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    
    const img = new Image();
    img.src = 'assets/certificado.png';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 2000, 1414);
      
      const userPhotoDataUrl = localStorage.getItem('br-captcha-user-photo');
      if (userPhotoDataUrl) {
        const userPhotoImg = new Image();
        userPhotoImg.src = userPhotoDataUrl;
        userPhotoImg.onload = () => {
          ctx.drawImage(userPhotoImg, 140, 142, 286, 286);
          drawCertificateTextsAndTrigger(canvas, ctx, fullName, firstName);
        };
      } else {
        drawCertificateTextsAndTrigger(canvas, ctx, fullName, firstName);
      }
    };
  }

  function drawCertificateTextsAndTrigger(canvas, ctx, fullName, firstName) {
    ctx.font = "80px 'Brittany', 'Great Vibes', 'Caveat', cursive";
    ctx.fillStyle = "#1a202c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fullName, 1000, 610);
    
    ctx.font = "40px 'Brittany', 'Great Vibes', 'Caveat', cursive";
    ctx.fillStyle = "#1a202c";
    ctx.fillText(firstName, 825, 820);
    
    ctx.font = "55px 'Brittany', 'Great Vibes', 'Caveat', cursive";
    ctx.fillStyle = "#1a365d";
    ctx.fillText(firstName, 1450, 1060);
    
    const link = document.createElement('a');
    link.download = `certificado-de-humanidade-${fullName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function triggerConfetti() {
    const colors = ['#f6e05e', '#ed64a6', '#667eea', '#48bb78', '#e53e3e', '#3182ce', '#dd6b20', '#319795'];
    for (let i = 0; i < 150; i++) {
      const confetti = el('div', 'confetti-piece');
      const size = Math.random() * 8 + 6;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size * (Math.random() * 1.5 + 0.5)}px`;
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.position = 'fixed';
      confetti.style.top = `-20px`;
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.opacity = Math.random();
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.zIndex = '10000';
      confetti.style.pointerEvents = 'none';
      
      const duration = Math.random() * 3 + 2;
      confetti.style.transition = `transform ${duration}s linear, top ${duration}s linear, opacity ${duration}s ease-out`;
      
      document.body.appendChild(confetti);
      
      confetti.offsetHeight;
      
      confetti.style.top = '105vh';
      confetti.style.transform = `translate3d(${Math.random() * 160 - 80}px, 0, 0) rotate(${Math.random() * 720}deg)`;
      confetti.style.opacity = '0';
      
      setTimeout(() => {
        confetti.remove();
      }, duration * 1000);
    }
  }

  const handleVerify = () => {
    const name = nameInput.value.trim();
    if (name) {
      SFX.correct();
      showVictoryScreen(name);
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  };

  verifyBtn.addEventListener('click', handleVerify);

  return () => {
    verifyBtn.removeEventListener('click', handleVerify);
  };
}
