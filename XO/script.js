// --- 1. DOM Selectors ---
const startScreen = document.getElementById('start-screen');
const pvpButton = document.getElementById('pvpButton');
const pvcButton = document.getElementById('pvcButton');
const nameScreen = document.getElementById('name-screen');
const playerXNameInput = document.getElementById('playerXName');
const playerONameInput = document.getElementById('playerOName');
const startGameButton = document.getElementById('startGameButton');
const difficultyScreen = document.getElementById('difficulty-screen');
const easyButton = document.getElementById('easyButton');
const impossibleButton = document.getElementById('impossibleButton');
const gameContainer = document.getElementById('game-container');
const cells = document.querySelectorAll('[data-cell-index]');
const statusText = document.getElementById('statusText');
const restartButton = document.getElementById('restartButton');
restartButton.textContent = "Restart Game";
const scoreboard = document.getElementById('scoreboard');
const playerXNameDisplay = document.getElementById('playerXNameDisplay');
const playerXScore = document.getElementById('playerXScore');
const playerONameDisplay = document.getElementById('playerONameDisplay');
const playerOScore = document.getElementById('playerOScore');
const playerXScoreCard = document.getElementById('playerXScoreCard');
const playerOScoreCard = document.getElementById('playerOScoreCard');
const pauseIcon = document.getElementById('pauseIcon');
const pauseOverlay = document.getElementById('pause-overlay');
const resumeButton = document.getElementById('resumeButton');
const menuBackButton = document.getElementById('menuBackButton');

// NEW Music Controls
const musicToggle = document.getElementById('music-toggle');
const soundOnIcon = document.getElementById('sound-on-icon');
const soundOffIcon = document.getElementById('sound-off-icon');
const backgroundAudio = document.getElementById('background-audio');

// --- 2. Game State Variables ---
let gameActive = true;
let isPaused = false;
let currentPlayer = 'X';
let gameState = ["", "", "", "", "", "", "", "", ""];
let gameMode = '';
let aiDifficulty = '';
let playerNames = { X: 'Player X', O: 'Player O' };
let scores = { X: 0, O: 0 };
let isMusicPlaying = false; // NEW music state

const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// --- LocalStorage Functions ---
function saveStateToLocalStorage() {
    const state = { scores: scores, playerNames: playerNames };
    localStorage.setItem('ticTacToeState', JSON.stringify(state));
}
function loadStateFromLocalStorage() {
    const savedState = localStorage.getItem('ticTacToeState');
    return savedState ? JSON.parse(savedState) : null;
}

// --- Helper Functions ---
const winningMessage = () => `${(gameMode === 'pvp') ? playerNames[currentPlayer] : `Player ${currentPlayer}`} has won! 🎉`;
const drawMessage = () => `Game ended in a draw! 🤝`;
const currentPlayerTurn = () => `${(gameMode === 'pvp') ? playerNames[currentPlayer] : `Player ${currentPlayer}`}'s turn (${currentPlayer})`;

// --- PvP Score Functions ---
function updateScoreboard() {
    playerXNameDisplay.textContent = playerNames.X;
    playerXScore.textContent = scores.X;
    playerONameDisplay.textContent = playerNames.O;
    playerOScore.textContent = scores.O;
    if (currentPlayer === 'X') {
        playerXScoreCard.classList.add('active');
        playerOScoreCard.classList.remove('active');
    } else {
        playerOScoreCard.classList.add('active');
        playerXScoreCard.classList.remove('active');
    }
}
function resetScores() {
    scores = { X: 0, O: 0 };
    playerNames = { X: 'Player X', O: 'Player O' };
}

// --- Core Game Functions ---
function startGame() {
    gameActive = true;
    isPaused = false;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.innerHTML = currentPlayerTurn();
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x', 'o');
    });
    pauseOverlay.classList.add('hidden');
    pauseIcon.classList.remove('disabled');
    if (gameMode === 'pvp') {
        updateScoreboard();
    }
}
function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
}
function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.innerHTML = currentPlayerTurn();
    if (gameMode === 'pvp') {
        updateScoreboard();
    }
    if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
        pauseIcon.classList.add('disabled');
        setTimeout(makeComputerMove, 500);
    } else {
        pauseIcon.classList.remove('disabled');
    }
}
function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winConditions.length; i++) {
        const winCondition = winConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }
    if (roundWon) {
        if (gameMode === 'pvp') {
            scores[currentPlayer]++;
            updateScoreboard();
            saveStateToLocalStorage();
        }
        statusText.innerHTML = winningMessage();
        gameActive = false;
        pauseIcon.classList.add('disabled');
        return;
    }
    if (!gameState.includes("")) {
        statusText.innerHTML = drawMessage();
        gameActive = false;
        pauseIcon.classList.add('disabled');
        if (gameMode === 'pvp') {
            playerXScoreCard.classList.remove('active');
            playerOScoreCard.classList.remove('active');
        }
        return;
    }
    handlePlayerChange();
}
function handleCellClick(event) {
    if (isPaused || !gameActive) return;
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    if (gameState[clickedCellIndex] !== "" || (gameMode === 'pvc' && currentPlayer === 'O')) {
        return;
    }
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

// --- App Control Functions ---
function selectMode(mode) {
    gameMode = mode;
    startScreen.classList.add('hidden');
    if (gameMode === 'pvp') {
        nameScreen.classList.remove('hidden');
        const savedState = loadStateFromLocalStorage();
        if (savedState) {
            playerXNameInput.value = savedState.playerNames.X;
            playerONameInput.value = savedState.playerNames.O;
        } else {
            playerXNameInput.value = '';
            playerONameInput.value = '';
        }
        scoreboard.classList.add('hidden');
        restartButton.textContent = "Restart Round";
    } else {
        difficultyScreen.classList.remove('hidden');
        scoreboard.classList.add('hidden');
        restartButton.textContent = "Restart Game";
    }
}
function selectDifficulty(difficulty) {
    aiDifficulty = difficulty;
    difficultyScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
}
function initializePvpGame() {
    const pXName = playerXNameInput.value.trim() || 'Player X';
    const pOName = playerONameInput.value.trim() || 'Player O';
    const savedState = loadStateFromLocalStorage();
    if (savedState && savedState.playerNames.X === pXName && savedState.playerNames.O === pOName) {
        scores = savedState.scores;
        playerNames = savedState.playerNames;
    } else {
        scores = { X: 0, O: 0 };
        playerNames = { X: pXName, O: pOName };
    }
    saveStateToLocalStorage();
    updateScoreboard();
    scoreboard.classList.remove('hidden');
    nameScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
}
function goBackToMenu() {
    gameContainer.classList.add('hidden');
    nameScreen.classList.add('hidden');
    difficultyScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    gameMode = '';
    aiDifficulty = '';
    pauseOverlay.classList.add('hidden');
    scoreboard.classList.add('hidden');
    resetScores();
    localStorage.removeItem('ticTacToeState');
}
function togglePause() {
    if (!gameActive || pauseIcon.classList.contains('disabled')) return;
    isPaused = !isPaused;
    if (isPaused) {
        pauseOverlay.classList.remove('hidden');
    } else {
        pauseOverlay.classList.add('hidden');
        if (gameMode === 'pvc' && currentPlayer === 'O' && gameActive) {
            pauseIcon.classList.add('disabled');
            setTimeout(makeComputerMove, 500);
        }
    }
}

// NEW Music Control Function
function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    if (isMusicPlaying) {
        // Music is now PLAYING
        backgroundAudio.play().catch(e => console.log("Browser prevented autoplay."));
        musicToggle.classList.add('playing');
        // Show the icon that represents "Sound is ON"
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
    } else {
        // Music is now PAUSED
        backgroundAudio.pause();
        musicToggle.classList.remove('playing');
        // Show the icon that represents "Sound is OFF"
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
    }
}

// --- Event Listeners ---
pvpButton.addEventListener('click', () => selectMode('pvp'));
pvcButton.addEventListener('click', () => selectMode('pvc'));
startGameButton.addEventListener('click', initializePvpGame);
easyButton.addEventListener('click', () => selectDifficulty('easy'));
impossibleButton.addEventListener('click', () => selectDifficulty('impossible'));
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', startGame);
pauseIcon.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);
menuBackButton.addEventListener('click', goBackToMenu);
musicToggle.addEventListener('click', toggleMusic); // NEW listener

// --- AI LOGIC (Unchanged) ---
const aiPlayer = 'O';
const humanPlayer = 'X';
function makeComputerMove() {
    if (isPaused || !gameActive) return;
    let chosenCellIndex;
    if (aiDifficulty === 'impossible') {
        chosenCellIndex = findBestMove().index;
    } else {
        const availableCells = getEmptyCells(gameState);
        const randomMoveIndex = Math.floor(Math.random() * availableCells.length);
        chosenCellIndex = availableCells[randomMoveIndex];
    }
    const chosenCell = document.querySelector(`[data-cell-index="${chosenCellIndex}"]`);
    handleCellPlayed(chosenCell, chosenCellIndex);
    handleResultValidation();
    if (gameActive) {
        pauseIcon.classList.remove('disabled');
    }
}
function getEmptyCells(board) {
    const cells = [];
    board.forEach((cell, index) => {
        if (cell === "") cells.push(index);
    });
    return cells;
}
function evaluate(board) {
    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            if (board[a] === aiPlayer) return 10;
            if (board[a] === humanPlayer) return -10;
        }
    }
    if (getEmptyCells(board).length === 0) return 0;
    return null;
}
function minimax(board, depth, isMaximizing) {
    let score = evaluate(board);
    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (score === 0) return 0;
    const emptyCells = getEmptyCells(board);
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (const index of emptyCells) {
            board[index] = aiPlayer;
            bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
            board[index] = "";
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const index of emptyCells) {
            board[index] = humanPlayer;
            bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
            board[index] = "";
        }
        return bestScore;
    }
}
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = { index: -1 };
    const emptyCells = getEmptyCells(gameState);
    for (const index of emptyCells) {
        gameState[index] = aiPlayer;
        let score = minimax(gameState, 0, false);
        gameState[index] = "";
        if (score > bestScore) {
            bestScore = score;
            bestMove.index = index;
        }
    }
    if (emptyCells.length === 9) {
        bestMove.index = 4;
    }
    return bestMove;
}