import { SFX, el } from '../shared.js';

export function renderWordCaptcha(parent, onComplete) {
  const CAPTCHAS = ['WVUGYQ', 'YHRPCD', 'FNZZSD'];
  let idx = Math.floor(Math.random() * 3);
  let animId = null;
  let startTime = null;
  let gl, program, uTimeLocation;

  const wrap = el('div', 'word-captcha-wrap');

  const instr = el('div', 'wc-instruction');
  instr.textContent = 'Prencha o texto abaixo';
  wrap.appendChild(instr);

  const canvasWrap = el('div', 'wc-canvas-wrap');
  const canvas = el('canvas', '');
  canvas.id = 'wavy-canvas';
  canvas.width = 400;
  canvas.height = 150;
  canvasWrap.appendChild(canvas);

  const refreshBtn = el('div', 'wc-refresh');
  refreshBtn.innerHTML = `<img src="assets/refresh.svg" alt="refresh">`;
  canvasWrap.appendChild(refreshBtn);

  const speakerBtn = el('img', 'wc-speaker', { src: 'assets/speaker.svg', alt: 'audio' });
  canvasWrap.appendChild(speakerBtn);

  wrap.appendChild(canvasWrap);

  const inputRow = el('div', 'wc-input-row');
  const input = el('input', 'wc-input', { type: 'text', placeholder: 'Resposta', autofocus: '' });
  const submitBtn = el('button', 'wc-submit');
  submitBtn.textContent = 'Enviar';
  inputRow.appendChild(input);
  inputRow.appendChild(submitBtn);
  wrap.appendChild(inputRow);

  parent.appendChild(wrap);

  function initGL() {
    gl = canvas.getContext('webgl');
    if (!gl) return;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_position * 0.5 + 0.5;
      }`);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, `
      precision mediump float;
      uniform sampler2D u_image;
      uniform float u_time;
      varying vec2 v_texCoord;
      void main() {
        vec2 uv = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
        float d = 0.04;
        uv.x += sin(uv.y * 10.0 + u_time * 1.5) * d;
        uv.y += cos(uv.x * 10.0 + u_time * 1.5) * d;
        vec4 c = texture2D(u_image, uv);
        vec3 bg = vec3(1.0);
        gl_FragColor = vec4(mix(bg, c.rgb, c.a), 1.0);
      }`);
    gl.compileShader(fs);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    uTimeLocation = gl.getUniformLocation(program, 'u_time');
  }

  function loadTexture(src) {
    if (!gl) return;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    img.src = src;
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
  }

  function animate() {
    if (!gl) return;
    const t = (performance.now() - startTime) / 1000;
    gl.uniform1f(uTimeLocation, t);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animId = requestAnimationFrame(animate);
  }

  initGL();
  loadTexture(`assets/word-captchas/${idx + 1}.webp`);
  startTime = performance.now();
  animate();

  const audios = [1, 2, 3].map(n => new Audio(`assets/word-captchas/${n}.mp3`));

  speakerBtn.addEventListener('click', () => {
    try { audios[idx].cloneNode().play(); } catch (error) {}
  });

  refreshBtn.addEventListener('click', () => {
    SFX.refresh();
    idx = (idx + 1) % 3;
    loadTexture(`assets/word-captchas/${idx + 1}.webp`);
    input.value = '';
  });

  function submit() {
    if (input.value.toUpperCase() === CAPTCHAS[idx]) {
      cancelAnimationFrame(animId);
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      input.classList.add('wrong');
      submitBtn.classList.add('wrong');
      setTimeout(() => {
        input.classList.remove('wrong');
        submitBtn.classList.remove('wrong');
      }, 800);
      input.value = '';
    }
  }

  submitBtn.addEventListener('click', submit);
  input.addEventListener('keyup', event => { if (event.key === 'Enter') submit(); });

  return () => { if (animId) cancelAnimationFrame(animId); };
}