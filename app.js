let currentPuzzle = null;
let currentBoard = [];
let solutionBoard = [];
let initialBoard = [];
let selectedCell = null;
let mistakes = 0;
let moveHistory = []; 
let timerInterval = null;
let elapsedSeconds = 0;
let isPaused = false;
let isGameOver = false;
let isGameWon = false;
let hintsRemaining = 3;
let currentDifficulty = 'hard';
let gridSize = 9;  
let boxSize = 3; 

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const btnEasy = document.getElementById('btnEasy');
const btnMedium = document.getElementById('btnMedium');
const btnHard = document.getElementById('btnHard');
const btnBack = document.getElementById('btnBack');
const btnPause = document.getElementById('btnPause');
const btnResume = document.getElementById('btnResume');
const btnFullscreenToggle = document.getElementById('btnFullscreenToggle');
const fsIcon = document.getElementById('fsIcon');
const btnUndo = document.getElementById('btnUndo');
const btnHint = document.getElementById('btnHint');
const hintBadge = document.getElementById('hintBadge');
const boardEl = document.getElementById('sudokuBoard');
const boardWrapper = document.getElementById('boardWrapper');
const pauseOverlay = document.getElementById('pauseOverlay');
const timerDisplay = document.getElementById('timerDisplay');
const mistakesHearts = document.getElementById('mistakesHearts');
const bestTimeValue = document.getElementById('bestTimeValue');
const bestTimeCard = document.getElementById('bestTimeCard');
const bestTimesDropdown = document.getElementById('bestTimesDropdown');
const bestTimesList = document.getElementById('bestTimesList');
const bestTimeWrapper = document.getElementById('bestTimeWrapper');
const winModal = document.getElementById('winModal');
const winTime = document.getElementById('winTime');
const winMistakes = document.getElementById('winMistakes');
const newRecord = document.getElementById('newRecord');
const btnNewGameWin = document.getElementById('btnNewGameWin');
const gameOverModal = document.getElementById('gameOverModal');
const btnNewGameOver = document.getElementById('btnNewGameOver');
const numpad = document.getElementById('numpad');
const confettiContainer = document.getElementById('confettiContainer');
const quitModal = document.getElementById('quitModal');
const btnHome = document.getElementById('btnHome');
const btnQuitCancel = document.getElementById('btnQuitCancel');
const btnQuitConfirm = document.getElementById('btnQuitConfirm');
const aboutDropdown = document.getElementById('about-dropdown');
const aboutBackdrop = document.getElementById('aboutBackdrop');
const btnAbout = document.getElementById('btnAbout');

document.addEventListener('DOMContentLoaded', () => {
    loadBestTime();
    createParticles();
});

btnEasy.addEventListener('click', () => startNewGame('easy'));
btnMedium.addEventListener('click', () => startNewGame('medium'));
btnHard.addEventListener('click', () => startNewGame('hard'));
btnBack.addEventListener('click', tryGoHome);
btnHome.addEventListener('click', tryGoHome);
btnPause.addEventListener('click', togglePause);
btnResume.addEventListener('click', togglePause);

btnFullscreenToggle.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.log(err));
        }
    }
});

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fsIcon.innerHTML = `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>`;
    } else {
        fsIcon.innerHTML = `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>`;
    }
});
btnUndo.addEventListener('click', undoMove);
btnHint.addEventListener('click', useHint);
btnNewGameWin.addEventListener('click', () => { hideModal(winModal); goToMenu(); });
btnNewGameOver.addEventListener('click', () => { hideModal(gameOverModal); goToMenu(); });
btnQuitCancel.addEventListener('click', () => { hideModal(quitModal); });
btnQuitConfirm.addEventListener('click', () => { hideModal(quitModal); goToMenu(); });
btnAbout.addEventListener('click', (e) => {
    e.stopPropagation();
    aboutDropdown.classList.toggle('hidden');
    if (aboutBackdrop) aboutBackdrop.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (aboutDropdown && !aboutDropdown.contains(e.target) && e.target !== btnAbout && !btnAbout.contains(e.target)) {
        aboutDropdown.classList.add('hidden');
        if (aboutBackdrop) aboutBackdrop.classList.add('hidden');
    }
});

bestTimeCard.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleBestTimesDropdown();
});

document.addEventListener('click', (e) => {
    if (bestTimeWrapper && !bestTimeWrapper.contains(e.target)) {
        closeBestTimesDropdown();
    }
});

numpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.num-btn');
    if (btn) {
        const num = parseInt(btn.dataset.num);
        placeNumber(num);
    }
});

document.addEventListener('keydown', (e) => {
    if (gameScreen.classList.contains('hidden') || isPaused || isGameOver || isGameWon) return;

    const maxNum = gridSize;
    if (e.key >= '1' && e.key <= String(maxNum)) {
        placeNumber(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        eraseCell();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoMove();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        navigateCell(e.key);
    }
});

function startNewGame(difficulty) {
    currentDifficulty = difficulty;

    if (difficulty === 'easy') {
        gridSize = 4;
        boxSize = 2;
    } else {
        gridSize = 9;
        boxSize = 3;
    }

    let puzzlePool;
    switch (difficulty) {
        case 'easy':   puzzlePool = PUZZLES_EASY; break;
        case 'medium': puzzlePool = PUZZLES_MEDIUM; break;
        case 'hard':   puzzlePool = PUZZLES_HARD; break;
    }

    const idx = Math.floor(Math.random() * puzzlePool.length);
    currentPuzzle = puzzlePool[idx];

    initialBoard = currentPuzzle.board.map(r => [...r]);
    currentBoard = currentPuzzle.board.map(r => [...r]);
    solutionBoard = currentPuzzle.solution.map(r => [...r]);

    selectedCell = null;
    mistakes = 0;
    moveHistory = [];
    elapsedSeconds = 0;
    isPaused = false;
    isGameOver = false;
    isGameWon = false;
    hintsRemaining = 3;

    updateMistakesDisplay();
    updateTimerDisplay();
    updateHintDisplay();
    buildNumpad();
    buildBoard();

    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('fullscreen-mode');
    pauseOverlay.classList.add('hidden');

    const header = document.querySelector('.app-header');
    if (header) header.classList.add('hidden');

    try {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        }
    } catch(e) {}

    startTimer();
}

function tryGoHome() {
    if (isGameOver || isGameWon) {
        goToMenu();
        return;
    }
    showModal(quitModal);
}

function goToMenu() {
    stopTimer();
    gameScreen.classList.add('hidden');
    gameScreen.classList.remove('fullscreen-mode');
    startScreen.classList.remove('hidden');

    const header = document.querySelector('.app-header');
    if (header) header.classList.remove('hidden');

    try {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }
    } catch(e) {}

    loadBestTime();
}

function buildNumpad() {
    numpad.innerHTML = '';

    if (gridSize === 4) {
        numpad.classList.add('numpad-4');
    } else {
        numpad.classList.remove('numpad-4');
    }

    for (let i = 1; i <= gridSize; i++) {
        const btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.dataset.num = i;
        btn.textContent = i;
        numpad.appendChild(btn);
    }
}

function buildBoard() {
    boardEl.innerHTML = '';

    if (gridSize === 4) {
        boardEl.classList.add('board-4x4');
        boardEl.style.gridTemplateColumns = `repeat(4, var(--cell-size))`;
        boardEl.style.gridTemplateRows = `repeat(4, var(--cell-size))`;
    } else {
        boardEl.classList.remove('board-4x4');
        boardEl.style.gridTemplateColumns = `repeat(9, var(--cell-size))`;
        boardEl.style.gridTemplateRows = `repeat(9, var(--cell-size))`;
    }

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.id = `cell-${row}-${col}`;

            if (row % boxSize === 0) cell.classList.add('box-top');
            if (col % boxSize === 0) cell.classList.add('box-left');
            if (row === gridSize - 1) cell.classList.add('box-bottom');
            if (col === gridSize - 1) cell.classList.add('box-right');

            if (initialBoard[row][col] !== 0) {
                cell.textContent = initialBoard[row][col];
                cell.classList.add('given');
            }

            cell.addEventListener('click', () => selectCell(row, col));
            boardEl.appendChild(cell);
        }
    }
}

function refreshBoard() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (!cell) continue;

            cell.classList.remove('selected', 'highlighted', 'correct', 'wrong', 'user-filled', 'same-number');

            const val = currentBoard[row][col];
            const isGiven = initialBoard[row][col] !== 0;

            if (isGiven) {
                cell.textContent = initialBoard[row][col];
                cell.classList.add('given');
            } else if (val !== 0) {
                cell.textContent = val;
                cell.classList.add('user-filled');

                if (val === solutionBoard[row][col]) {
                    cell.classList.add('correct');
                } else {
                    cell.classList.add('wrong');
                }
            } else {
                cell.textContent = '';
            }

            if (selectedCell) {
                const sr = selectedCell.row;
                const sc = selectedCell.col;

                const sameRow = row === sr;
                const sameCol = col === sc;
                const sameBox = (Math.floor(row / boxSize) === Math.floor(sr / boxSize)) &&
                                (Math.floor(col / boxSize) === Math.floor(sc / boxSize));

                if (row === sr && col === sc) {
                    cell.classList.add('selected');
                } else if (sameRow || sameCol || sameBox) {
                    cell.classList.add('highlighted');
                }

                const selectedVal = currentBoard[sr][sc];
                if (selectedVal !== 0 && val === selectedVal && !(row === sr && col === sc)) {
                    cell.classList.add('same-number');
                }
            }
        }
    }
}

function selectCell(row, col) {
    if (isGameOver || isGameWon || isPaused) return;

    selectedCell = { row, col };
    refreshBoard();

    const cell = document.getElementById(`cell-${row}-${col}`);
    if (cell) {
        cell.classList.add('cell-pop');
        setTimeout(() => cell.classList.remove('cell-pop'), 200);
    }
}

function navigateCell(direction) {
    if (!selectedCell) {
        selectCell(0, 0);
        return;
    }

    let { row, col } = selectedCell;
    const maxIdx = gridSize - 1;

    switch (direction) {
        case 'ArrowUp':    row = Math.max(0, row - 1); break;
        case 'ArrowDown':  row = Math.min(maxIdx, row + 1); break;
        case 'ArrowLeft':  col = Math.max(0, col - 1); break;
        case 'ArrowRight': col = Math.min(maxIdx, col + 1); break;
    }

    selectCell(row, col);
}

function placeNumber(num) {
    if (!selectedCell || isGameOver || isGameWon || isPaused) return;
    if (num > gridSize) return;

    const { row, col } = selectedCell;

    if (initialBoard[row][col] !== 0) return;

    const prevValue = currentBoard[row][col];

    if (prevValue === num) return;

    let wasMistake = false;

    if (num !== solutionBoard[row][col]) {
        wasMistake = true;
        mistakes++;
        updateMistakesDisplay();
        shakeCell(row, col);

        if (mistakes >= 3) {
            currentBoard[row][col] = num;
            refreshBoard();
            gameOver();
            return;
        }
    }

    currentBoard[row][col] = num;

    moveHistory.push({ row, col, prevValue, newValue: num, wasMistake });

    refreshBoard();

    const cell = document.getElementById(`cell-${row}-${col}`);
    if (cell) {
        cell.classList.add('cell-place');
        setTimeout(() => cell.classList.remove('cell-place'), 300);
    }

    checkWin();
}

function eraseCell() {
    if (!selectedCell || isGameOver || isGameWon || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== 0) return;
    if (currentBoard[row][col] === 0) return;

    const prevValue = currentBoard[row][col];
    currentBoard[row][col] = 0;

    moveHistory.push({ row, col, prevValue, newValue: 0, wasMistake: false });
    refreshBoard();
}

function undoMove() {
    if (moveHistory.length === 0 || isGameOver || isGameWon || isPaused) return;

    const move = moveHistory.pop();
    currentBoard[move.row][move.col] = move.prevValue;

    selectedCell = { row: move.row, col: move.col };
    refreshBoard();
}

function useHint() {
    if (hintsRemaining <= 0 || isGameOver || isGameWon || isPaused) return;

    const emptyCells = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (currentBoard[r][c] !== solutionBoard[r][c]) {
                emptyCells.push({ row: r, col: c });
            }
        }
    }

    if (emptyCells.length === 0) return;

    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = target;
    const correctValue = solutionBoard[row][col];

    currentBoard[row][col] = correctValue;

    moveHistory.push({ row, col, prevValue: 0, newValue: correctValue, wasMistake: false });

    selectedCell = { row, col };
    refreshBoard();

    const cell = document.getElementById(`cell-${row}-${col}`);
    if (cell) {
        cell.classList.add('cell-hint');
        setTimeout(() => cell.classList.remove('cell-hint'), 800);
    }

    hintsRemaining--;
    updateHintDisplay();

    checkWin();
}

function updateHintDisplay() {
    hintBadge.textContent = hintsRemaining;
    if (hintsRemaining <= 0) {
        btnHint.classList.add('disabled');
        hintBadge.classList.add('empty');
    } else {
        btnHint.classList.remove('disabled');
        hintBadge.classList.remove('empty');
    }
}

function updateMistakesDisplay() {
    const hearts = ['heart1', 'heart2', 'heart3'];
    for (let i = 0; i < 3; i++) {
        const heartEl = document.getElementById(hearts[i]);
        if (i < 3 - mistakes) {
            heartEl.textContent = '❤️';
            heartEl.classList.add('active');
            heartEl.classList.remove('lost');
        } else {
            heartEl.textContent = '🖤';
            heartEl.classList.remove('active');
            heartEl.classList.add('lost');
            // Animate heart break
            heartEl.classList.add('heart-break');
            setTimeout(() => heartEl.classList.remove('heart-break'), 500);
        }
    }
}

function shakeCell(row, col) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    if (cell) {
        cell.classList.add('cell-shake');
        setTimeout(() => cell.classList.remove('cell-shake'), 500);
    }
}

function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    timerInterval = setInterval(() => {
        if (!isPaused) {
            elapsedSeconds++;
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const min = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const sec = (elapsedSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
}

function togglePause() {
    if (isGameOver || isGameWon) return;

    isPaused = !isPaused;

    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
        boardWrapper.classList.add('board-blurred');
    } else {
        pauseOverlay.classList.add('hidden');
        boardWrapper.classList.remove('board-blurred');
    }
}

function checkWin() {
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (currentBoard[r][c] !== solutionBoard[r][c]) return;
        }
    }

    isGameWon = true;
    stopTimer();

    const timeStr = timerDisplay.textContent;
    winTime.textContent = timeStr;
    winMistakes.textContent = mistakes;

    const bestTime = getBestTime();
    if (bestTime === null || elapsedSeconds < bestTime) {
        saveBestTime(elapsedSeconds, currentDifficulty);
        newRecord.classList.remove('hidden');
    } else {
        saveBestTime(elapsedSeconds, currentDifficulty);
        newRecord.classList.add('hidden');
    }

    setTimeout(() => {
        showModal(winModal);
        createConfetti();
    }, 400);
}

function gameOver() {
    isGameOver = true;
    stopTimer();
    refreshBoard();

    setTimeout(() => {
        showModal(gameOverModal);
    }, 600);
}

function showModal(modal) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('visible'), 10);
}

function hideModal(modal) {
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function getBestTimes() {
    const stored = localStorage.getItem('sudoku_best_times_v2');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                if (typeof parsed[0] === 'object') return parsed;
                // Migrate plain numbers → objects
                return parsed.map(s => ({ seconds: s, mode: 'hard' }));
            }
            return [];
        } catch {
            return [];
        }
    }
  
    const oldTimes = localStorage.getItem('sudoku_best_times');
    if (oldTimes) {
        try {
            const arr = JSON.parse(oldTimes);
            const migrated = arr.map(s => ({ seconds: s, mode: 'hard' }));
            localStorage.setItem('sudoku_best_times_v2', JSON.stringify(migrated));
            localStorage.removeItem('sudoku_best_times');
            return migrated;
        } catch {
            // ignore
        }
    }
    const oldBest = localStorage.getItem('sudoku_best_time');
    if (oldBest) {
        const migrated = [{ seconds: parseInt(oldBest), mode: 'hard' }];
        localStorage.setItem('sudoku_best_times_v2', JSON.stringify(migrated));
        localStorage.removeItem('sudoku_best_time');
        return migrated;
    }
    return [];
}

function getBestTime() {
    const times = getBestTimes();
    return times.length > 0 ? times[0].seconds : null;
}

function saveBestTime(seconds, mode) {
    let times = getBestTimes();
    times.push({ seconds, mode });
    times.sort((a, b) => a.seconds - b.seconds);
    times = times.slice(0, 3); 
    localStorage.setItem('sudoku_best_times_v2', JSON.stringify(times));
}

function formatTime(totalSeconds) {
    const min = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const sec = (totalSeconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function loadBestTime() {
    const times = getBestTimes();
    if (times.length > 0) {
        bestTimeValue.textContent = formatTime(times[0].seconds);
        bestTimeCard.classList.add('has-time');
        bestTimeWrapper.style.display = '';
    } else {
        bestTimeWrapper.style.display = 'none';
    }
    renderBestTimesList(times);
}

function renderBestTimesList(times) {
    bestTimesList.innerHTML = '';
    if (times.length === 0) {
        const li = document.createElement('li');
        li.className = 'best-time-empty';
        li.textContent = 'No times recorded yet';
        bestTimesList.appendChild(li);
        return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    times.forEach((entry, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="time-display">${formatTime(entry.seconds)}</span>
            <span class="mode-badge ${entry.mode}">${capitalizeFirst(entry.mode)}</span>
            <span class="time-rank-label">${medals[i] || ''} ${i === 0 ? 'Best' : ''}</span>
        `;
        bestTimesList.appendChild(li);
    });
}

function toggleBestTimesDropdown() {
    const isOpen = !bestTimesDropdown.classList.contains('hidden');
    if (isOpen) {
        closeBestTimesDropdown();
    } else {
        bestTimesDropdown.classList.remove('hidden');
        bestTimeWrapper.classList.add('open');
    }
}

function closeBestTimesDropdown() {
    bestTimesDropdown.classList.add('hidden');
    bestTimeWrapper.classList.remove('open');
}

function createParticles() {
    const container = document.getElementById('bgParticles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 20) + 's';
        particle.style.width = (2 + Math.random() * 6) + 'px';
        particle.style.height = particle.style.width;
        particle.style.opacity = (0.08 + Math.random() * 0.15);
        container.appendChild(particle);
    }
}

function createConfetti() {
    confettiContainer.innerHTML = '';
    const colors = ['#6C63FF', '#00B4D8', '#F87171', '#FBBF24', '#34D399', '#FB923C'];

    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (1 + Math.random() * 2) + 's';
        confetti.style.width = (4 + Math.random() * 8) + 'px';
        confetti.style.height = (4 + Math.random() * 8) + 'px';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(confetti);
    }
}
