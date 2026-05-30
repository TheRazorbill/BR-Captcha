import { SFX, el, makeGridCaptcha, shakeWrong } from '../shared.js';

export function renderTicTacToe(parent, onComplete) {
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
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

  function playS(key) {
    try { sounds[key].cloneNode().play(); } catch (error) {}
  }

  const { content, refreshImg, verifyBtn } = makeGridCaptcha('Jogo da velha', 'Me vença no', parent);

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
    const value = board[i];
    if (!value) {
      cells[i].innerHTML = '';
      return;
    }
    if (value === 'X') {
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
    if (board.every(value => value !== null)) return { winner: 'draw', line: null };
    return null;
  }

  function findWinMove(player) {
    for (const line of LINES) {
      const vals = line.map(i => board[i]);
      if (vals.filter(v => v === player).length === 2 && vals.includes(null)) {
        return line[vals.indexOf(null)];
      }
    }
    return -1;
  }

  function computerBestMove() {
    let move = findWinMove('O');
    if (move !== -1) return move;
    move = findWinMove('X');
    if (move !== -1) return move;
    if (board[4] === null) return 4;
    for (const corner of [0, 2, 6, 8]) if (board[corner] === null) return corner;
    for (let i = 0; i < 9; i++) if (board[i] === null) return i;
    return -1;
  }

  function drawWinLine(line) {
    const [a,, d] = line;
    const v = 25;
    const pos = i => ({ r: Math.floor(i / 3), c: i % 3 });
    const pa = pos(a), pd = pos(d);
    let x1, y1, x2, y2;
    if (pa.r === pd.r) {
      x1 = 100 * pa.c + v; y1 = 100 * pa.r + 50; x2 = 100 * (pd.c + 1) - v; y2 = 100 * pd.r + 50;
    } else if (pa.c === pd.c) {
      x1 = 100 * pa.c + 50; y1 = 100 * pa.r + v; x2 = 100 * pd.c + 50; y2 = 100 * (pd.r + 1) - v;
    } else if (a === 0 && d === 8) {
      x1 = v; y1 = v; x2 = 275; y2 = 275;
    } else {
      x1 = 275; y1 = v; x2 = v; y2 = 275;
    }
    const overlay = el('div', 'winning-line-overlay');
    overlay.innerHTML = `<svg class="winning-line-svg" viewBox="0 0 300 300">
      <line x1="${x1}" y1="${y1 - 3}" x2="${x2}" y2="${y2 - 3}"
        stroke="${winner === 'X' ? 'black' : 'red'}" stroke-width="2"
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
    cells.forEach(cell => cell.classList.add('disabled'));
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
      const empty = board.map((value, i) => value === null ? i : -1).filter(i => i >= 0);
      if (empty.length) move = empty[Math.floor(Math.random() * empty.length)];
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
    cells.forEach(cell => { cell.innerHTML = ''; cell.classList.remove('disabled'); });
    const old = tttCont.querySelector('.winning-line-overlay');
    if (old) old.remove();
    winner = null;
    winLine = null;
    locked = false;
    currentPlayer = 'X';
    gameNum++;
  });

  verifyBtn.addEventListener('click', () => {
    if (winner === 'X') {
      SFX.correct();
      onComplete();
    } else {
      SFX.wrong();
      shakeWrong(verifyBtn);
    }
  });

  return null;
}