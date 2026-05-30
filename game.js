// ─── Audio ───────────────────────────────────────────────────────────────────
function playAudio(src, volume = 1) {
  const a = new Audio(src);
  a.volume = volume;
  a.play().catch(() => {});
}

const SFX = {
  click:   () => playAudio('assets/click.mp3', 0.75),
  correct: () => playAudio('assets/correct.mp3', 0.3),
  wrong:   () => playAudio('assets/wrong.mp3', 0.3),
  refresh: () => playAudio('assets/refresh.mp3', 0.3),
};

// ─── State ───────────────────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Checkbox',    render: renderCheckbox },
  { name: 'Stop Sign',   render: renderStopSigns },
  { name: 'Vegetable',   render: renderVegetables },
  { name: 'Rotation',    render: renderRotating },
  { name: 'Tic Tac Toe', render: renderTicTacToe },
  { name: 'Word Captcha',render: renderWordCaptcha },
];

let currentLevel = parseInt(localStorage.getItem('not-a-robot-level') || '0');
let cleanup = null;

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const $content    = document.getElementById('content');
const $levelLabel = document.getElementById('header-level');
const $resetBtn   = document.getElementById('footer-reset');
const $modalOverlay = document.getElementById('modal-overlay');
const $modalBtnCancel = document.getElementById('modal-cancel');
const $modalBtnReset  = document.getElementById('modal-reset');

// ─── Navigation ──────────────────────────────────────────────────────────────
function goToLevel(n) {
  if (cleanup) { cleanup(); cleanup = null; }
  currentLevel = Math.max(0, Math.min(n, LEVELS.length - 1));
  localStorage.setItem('not-a-robot-level', currentLevel);
  $levelLabel.textContent = `Level ${currentLevel + 1}: ${LEVELS[currentLevel].name}`;
  $content.innerHTML = '';
  cleanup = LEVELS[currentLevel].render($content, () => {
    setTimeout(() => goToLevel(currentLevel + 1), 800);
  });
}

function nextLevel() { goToLevel(currentLevel + 1); }

// ─── Reset modal ─────────────────────────────────────────────────────────────
$resetBtn.addEventListener('click', () => $modalOverlay.classList.add('visible'));
$modalBtnCancel.addEventListener('click', () => $modalOverlay.classList.remove('visible'));
$modalBtnReset.addEventListener('click', () => {
  $modalOverlay.classList.remove('visible');
  goToLevel(0);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function el(tag, cls, attrs = {}) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
}

function makeGrid(size, image, parent) {
  const wrap = el('div', 'grid-inner');
  wrap.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  wrap.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  const selected = new Set();
  const items = [];

  for (let i = 0; i < size * size; i++) {
    const cell = el('div', 'grid-item');
    if (image) {
      const cols = size, rows = size;
      const x = 100 * (i % cols) / (cols - 1);
      const y = 100 * Math.floor(i / cols) / (rows - 1);
      cell.style.backgroundImage = `url(${image})`;
      cell.style.backgroundSize = `${100 * cols}% ${100 * rows}%`;
      cell.style.backgroundPosition = `${x}% ${y}%`;
      cell.style.backgroundRepeat = 'no-repeat';
    }
    cell.addEventListener('click', () => {
      SFX.click();
      if (selected.has(i)) { selected.delete(i); cell.classList.remove('selected'); }
      else { selected.add(i); cell.classList.add('selected'); }
    });
    items.push(cell);
    wrap.appendChild(cell);
  }
  parent.appendChild(wrap);

  return {
    getSelected: () => [...selected],
    reset: () => { selected.clear(); items.forEach(c => c.classList.remove('selected')); },
  };
}

function makeGridCaptcha(title, instruction, parent) {
  const container = el('div', 'captcha-container');

  const header = el('div', 'captcha-title');
  header.innerHTML = `${instruction}<div class="captcha-title-type">${title}</div>`;
  container.appendChild(header);

  const content = el('div', 'captcha-content');
  container.appendChild(content);

  const controls = el('div', 'captcha-controls');
  const refreshImg = el('img', 'captcha-refresh', { src: 'assets/refresh.svg', alt: '' });
  const verifyBtn = el('button', 'verify-btn');
  verifyBtn.textContent = 'Verify';
  controls.appendChild(refreshImg);
  controls.appendChild(verifyBtn);
  container.appendChild(controls);
  parent.appendChild(container);

  return { content, refreshImg, verifyBtn };
}

function shakeWrong(btn) {
  btn.classList.add('wrong');
  setTimeout(() => btn.classList.remove('wrong'), 800);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 1 – Checkbox
// ═══════════════════════════════════════════════════════════════════════════════
function renderCheckbox(parent, onComplete) {
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
  text.textContent = "I'm not a robot";

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

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 2 – Stop Signs
// ═══════════════════════════════════════════════════════════════════════════════
function renderStopSigns(parent, onComplete) {
  const CORRECT = [
    [2,3,6,7],
    [0,1,2,4,5,6,8,9,10],
    [1,2,3,5,6,7,9,10,11],
    [0,1,2,4,5,6],
  ];
  let idx = 0;

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Stop Sign', 'Select all the squares with a', parent);
  let grid = makeGrid(4, `assets/stop-signs/${idx + 1}.webp`, content);

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    idx = (idx + 1) % 4;
    content.innerHTML = '';
    grid = makeGrid(4, `assets/stop-signs/${idx + 1}.webp`, content);
  });

  verifyBtn.addEventListener('click', () => {
    const sel = grid.getSelected();
    const correct = CORRECT[idx];
    const ok = sel.length === correct.length && sel.every(i => correct.includes(i));
    if (ok) { SFX.correct(); onComplete(); }
    else { SFX.wrong(); shakeWrong(verifyBtn); grid.reset(); }
  });

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 3 – Vegetables
// ═══════════════════════════════════════════════════════════════════════════════
function renderVegetables(parent, onComplete) {
  const VEGS = ['tomato','carrot','onion','banana','grape','corn','avocado','potato','eggplant'];
  const CORRECT = ['carrot','onion','corn','potato'];
  const OPTIONAL = ['eggplant'];

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Vegetable', 'Select all the squares with a', parent);

  const gridWrap = el('div', 'grid-inner');
  gridWrap.style.gridTemplateColumns = 'repeat(3, 1fr)';
  gridWrap.style.gridTemplateRows = 'repeat(3, 1fr)';
  const selected = new Set();
  const cells = [];

  VEGS.forEach((veg, i) => {
    const cell = el('div', 'grid-item');
    const img = el('img', 'veg-img', { src: `assets/vegetables/${veg}.webp`, alt: veg });
    cell.appendChild(img);
    cell.addEventListener('click', () => {
      SFX.click();
      if (selected.has(i)) { selected.delete(i); cell.classList.remove('selected'); }
      else { selected.add(i); cell.classList.add('selected'); }
    });
    cells.push(cell);
    gridWrap.appendChild(cell);
  });
  content.appendChild(gridWrap);

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    selected.clear();
    cells.forEach(c => c.classList.remove('selected'));
  });

  verifyBtn.addEventListener('click', () => {
    const selNames = [...selected].map(i => VEGS[i]);
    let errors = 0;
    CORRECT.forEach(c => { if (!selNames.includes(c)) errors++; });
    selNames.forEach(s => { if (!CORRECT.includes(s) && !OPTIONAL.includes(s)) errors++; });

    if (errors <= 1) { SFX.correct(); onComplete(); }
    else { SFX.wrong(); shakeWrong(verifyBtn); selected.clear(); cells.forEach(c => c.classList.remove('selected')); }
  });

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 4 – Rotating
// ═══════════════════════════════════════════════════════════════════════════════
function renderRotating(parent, onComplete) {
  const rotations = Array.from({ length: 9 }, () => 90 * Math.floor(4 * Math.random()));

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Intersection', 'Reassemble the', parent);

  const rotateCont = el('div', 'rotating-container');

  function getPos(i) {
    const x = 100 * (i % 3) / 2;
    const y = 100 * Math.floor(i / 3) / 2;
    return `${x}% ${y}%`;
  }

  const items = rotations.map((rot, i) => {
    const div = el('div', 'rotating-item');
    div.style.backgroundPosition = getPos(i);
    div.style.transform = `rotate(${rot}deg)`;
    div.addEventListener('click', () => {
      SFX.click();
      rotations[i] = (rotations[i] + 90) % 360;
      div.style.transform = `rotate(${rotations[i]}deg)`;
    });
    rotateCont.appendChild(div);
    return div;
  });
  content.appendChild(rotateCont);

  function shuffle() {
    rotations.forEach((_, i) => {
      rotations[i] = 90 * Math.floor(4 * Math.random());
      items[i].style.transform = `rotate(${rotations[i]}deg)`;
    });
  }

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    shuffle();
  });

  verifyBtn.addEventListener('click', () => {
    if (rotations.every(r => r % 360 === 0)) { SFX.correct(); onComplete(); }
    else { SFX.wrong(); shakeWrong(verifyBtn); }
  });

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 5 – Tic Tac Toe
// ═══════════════════════════════════════════════════════════════════════════════
function renderTicTacToe(parent, onComplete) {
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const board = Array(9).fill(null);
  let currentPlayer = 'X';
  let winner = null;
  let winLine = null;
  let gameNum = 0;
  let locked = false;

  const sounds = {
    x: new Audio('assets/tic-tac-toe/x.mp3'),
    o: new Audio('assets/tic-tac-toe/o.mp3'),
    strike: new Audio('assets/tic-tac-toe/strike.mp3'),
  };
  function playS(k) { try { sounds[k].cloneNode().play(); } catch(e) {} }

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Tic Tac Toe', 'Win at', parent);

  const tttCont = el('div', 'ttt-container');
  const gridWrap = el('div', 'grid-inner');
  gridWrap.style.gridTemplateColumns = 'repeat(3, 1fr)';
  gridWrap.style.gridTemplateRows = 'repeat(3, 1fr)';

  const cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = el('div', 'ttt-cell');
    cell.addEventListener('click', () => playerMove(i));
    cells.push(cell);
    gridWrap.appendChild(cell);
  }

  tttCont.appendChild(gridWrap);
  content.appendChild(tttCont);

  function renderCell(i) {
    const v = board[i];
    if (!v) { cells[i].innerHTML = ''; return; }
    if (v === 'X') {
      cells[i].innerHTML = `<svg viewBox="0 0 100 100">
        <line x1="20" y1="20" x2="80" y2="80" stroke="black" stroke-width="5" stroke-dasharray="85" stroke-dashoffset="85">
          <animate attributeName="stroke-dashoffset" from="85" to="0" dur="0.15s" fill="freeze"/>
        </line>
        <line x1="80" y1="20" x2="20" y2="80" stroke="black" stroke-width="5" stroke-dasharray="85" stroke-dashoffset="85">
          <animate attributeName="stroke-dashoffset" from="85" to="0" dur="0.15s" begin="0.15s" fill="freeze"/>
        </line></svg>`;
    } else {
      cells[i].innerHTML = `<svg viewBox="0 0 100 100">
        <circle cx="45" cy="50" r="36" stroke="red" stroke-width="4" fill="none"
          stroke-dasharray="251.2" stroke-dashoffset="251.2" transform="rotate(-90 50 50)">
          <animate attributeName="stroke-dashoffset" from="251.2" to="0" dur=".3s" fill="freeze"/>
        </circle></svg>`;
    }
  }

  function checkWin() {
    for (const line of LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return { winner: board[a], line };
      }
    }
    if (board.every(v => v !== null)) return { winner: 'draw', line: null };
    return null;
  }

  function findWinMove(player) {
    for (const line of LINES) {
      const vals = line.map(i => board[i]);
      if (vals.filter(v => v === player).length === 2 && vals.includes(null))
        return line[vals.indexOf(null)];
    }
    return -1;
  }

  function computerBestMove() {
    let m = findWinMove('O');
    if (m !== -1) return m;
    m = findWinMove('X');
    if (m !== -1) return m;
    if (board[4] === null) return 4;
    for (const c of [0,2,6,8]) if (board[c] === null) return c;
    for (let i = 0; i < 9; i++) if (board[i] === null) return i;
    return -1;
  }

  function drawWinLine(line) {
    const [a,,d] = line;
    const v = 25;
    const pos = i => ({ r: Math.floor(i/3), c: i%3 });
    const pa = pos(a), pd = pos(d);
    let x1,y1,x2,y2;
    if (pa.r === pd.r) {
      x1=100*pa.c+v; y1=100*pa.r+50; x2=100*(pd.c+1)-v; y2=100*pd.r+50;
    } else if (pa.c === pd.c) {
      x1=100*pa.c+50; y1=100*pa.r+v; x2=100*pd.c+50; y2=100*(pd.r+1)-v;
    } else if (a===0 && d===8) {
      x1=v; y1=v; x2=275; y2=275;
    } else {
      x1=275; y1=v; x2=v; y2=275;
    }
    const overlay = el('div', 'winning-line-overlay');
    overlay.innerHTML = `<svg class="winning-line-svg" viewBox="0 0 300 300">
      <line x1="${x1}" y1="${y1-3}" x2="${x2}" y2="${y2-3}"
        stroke="${winner==='X'?'black':'red'}" stroke-width="2"
        stroke-dasharray="400" stroke-dashoffset="400">
        <animate attributeName="stroke-dashoffset" from="400" to="0" dur="0.6s" begin="0.3s" fill="freeze"/>
      </line></svg>`;
    tttCont.appendChild(overlay);
  }

  function afterMove() {
    const result = checkWin();
    if (!result) return;
    winner = result.winner;
    winLine = result.line;
    locked = true;
    cells.forEach(c => c.classList.add('disabled'));
    if (winLine) {
      setTimeout(() => {
        playS('strike');
        drawWinLine(winLine);
      }, 250);
    }
  }

  function computerMove() {
    if (locked) return;
    playS('o');
    let move;
    if (Math.random() < 0.4 && gameNum > 0) {
      const empty = board.map((v,i) => v===null?i:-1).filter(i=>i>=0);
      if (empty.length) move = empty[Math.floor(Math.random()*empty.length)];
    }
    if (move === undefined) move = computerBestMove();
    if (move === -1) return;
    board[move] = 'O';
    renderCell(move);
    currentPlayer = 'X';
    afterMove();
  }

  function playerMove(i) {
    if (locked || currentPlayer !== 'X' || board[i] !== null) return;
    board[i] = 'X';
    renderCell(i);
    playS('x');
    currentPlayer = 'O';
    afterMove();
    if (!locked) setTimeout(computerMove, 450);
  }

  refreshImg.addEventListener('click', () => {
    SFX.refresh();
    refreshImg.classList.add('spinning');
    setTimeout(() => refreshImg.classList.remove('spinning'), 500);
    board.fill(null);
    cells.forEach(c => { c.innerHTML = ''; c.classList.remove('disabled'); });
    const old = tttCont.querySelector('.winning-line-overlay');
    if (old) old.remove();
    winner = null; winLine = null; locked = false; currentPlayer = 'X';
    gameNum++;
  });

  verifyBtn.addEventListener('click', () => {
    if (winner === 'X') { SFX.correct(); onComplete(); }
    else { SFX.wrong(); shakeWrong(verifyBtn); }
  });


  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEVEL 6 – Word Captcha (WebGL wavy text)
// ═══════════════════════════════════════════════════════════════════════════════
function renderWordCaptcha(parent, onComplete) {
  const CAPTCHAS = ['WVUGYQ','YHRPCD','FNZZSD'];
  let idx = Math.floor(Math.random() * 3);
  let animId = null;
  let startTime = null;
  let gl, program, uTimeLocation;

  const wrap = el('div', 'word-captcha-wrap');

  const instr = el('div', 'wc-instruction');
  instr.textContent = 'Enter the text below';
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
  const input = el('input', 'wc-input', { type: 'text', placeholder: 'Answer', autofocus: '' });
  const submitBtn = el('button', 'wc-submit');
  submitBtn.textContent = 'Submit';
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    uTimeLocation = gl.getUniformLocation(program, 'u_time');
  }

  function loadTexture(src) {
    if (!gl) return;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    };
    img.src = src;
    gl.uniform1i(gl.getUniformLocation(program,'u_image'),0);
  }

  function animate() {
    if (!gl) return;
    const t = (performance.now() - startTime) / 1000;
    gl.uniform1f(uTimeLocation, t);
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    animId = requestAnimationFrame(animate);
  }

  initGL();
  loadTexture(`assets/word-captchas/${idx+1}.webp`);
  startTime = performance.now();
  animate();

  const audios = [1,2,3].map(n => new Audio(`assets/word-captchas/${n}.mp3`));

  speakerBtn.addEventListener('click', () => {
    try { audios[idx].cloneNode().play(); } catch(e) {}
  });

  refreshBtn.addEventListener('click', () => {
    SFX.refresh();
    idx = (idx + 1) % 3;
    loadTexture(`assets/word-captchas/${idx+1}.webp`);
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
      setTimeout(() => { input.classList.remove('wrong'); submitBtn.classList.remove('wrong'); }, 800);
      input.value = '';
    }
  }

  submitBtn.addEventListener('click', submit);
  input.addEventListener('keyup', e => { if (e.key === 'Enter') submit(); });

  return () => { if (animId) cancelAnimationFrame(animId); };
}

// ─── Start ────────────────────────────────────────────────────────────────────
goToLevel(currentLevel);
