// Game constants
const GRID_SIZE = 24;
const CANVAS_SIZE = 600;
const INITIAL_SPEED = 100; // medium
const SPEED_INCREMENT = 4; // ms faster per food
const MIN_SPEED = 40;

// Game variables
let canvas, ctx;
let bitmoji, foods;
let bitmojiLoaded = false;
let snake = [];
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed = INITIAL_SPEED;
let gameLoop;
let isPaused = false;
let isGameOver = false;
let food;

function loadImages() {
    bitmoji = new Image();
    bitmoji.src = '../../assets/images/bitmoji.png';
    bitmojiLoaded = false;
    bitmoji.onload = () => { bitmojiLoaded = true; };
    bitmoji.onerror = () => { bitmojiLoaded = false; };
    foods = {
        normal: ['🍇', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓'],
        special: ['🥮', '🍢', '🍡', '🥟', '🍱', '🍛', '🍜', '🍝', '🍞', '🥐', '🥨', '🥯', '🥞']
    };
}

function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const startX = Math.floor(canvas.width / GRID_SIZE / 2) * GRID_SIZE;
    const startY = Math.floor(canvas.height / GRID_SIZE / 2) * GRID_SIZE;
    snake = [{x: startX, y: startY}];
    loadImages();
    food = spawnFood();
    document.getElementById('highScore').textContent = highScore;
    drawGame();
    gameSpeed = INITIAL_SPEED;
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, gameSpeed);
}

function spawnFood() {
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * gridWidth) * GRID_SIZE;
        foodY = Math.floor(Math.random() * gridHeight) * GRID_SIZE;
    } while (snake.some(segment => segment.x === foodX && segment.y === foodY));
    return {
        x: foodX,
        y: foodY,
        type: Math.random() < 0.2 ? 'special' : 'normal',
        emoji: Math.random() < 0.2 
            ? foods.special[Math.floor(Math.random() * foods.special.length)]
            : foods.normal[Math.floor(Math.random() * foods.normal.length)]
    };
}

function updateGame() {
    if (isPaused || isGameOver) return;
    direction = nextDirection;
    const head = {...snake[0]};
    switch (direction) {
        case 'UP': head.y -= GRID_SIZE; break;
        case 'DOWN': head.y += GRID_SIZE; break;
        case 'LEFT': head.x -= GRID_SIZE; break;
        case 'RIGHT': head.x += GRID_SIZE; break;
    }
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += food.type === 'special' ? 20 : 10;
        food = spawnFood();
        // Increase speed
        gameSpeed = Math.max(MIN_SPEED, gameSpeed - SPEED_INCREMENT);
        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, gameSpeed);
    } else {
        snake.pop();
    }
    document.getElementById('score').textContent = score;
    drawGame();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            if (bitmojiLoaded) {
                ctx.drawImage(bitmoji, segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            } else {
                ctx.fillStyle = '#4a90e2';
                ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
                ctx.font = `${GRID_SIZE * 0.8}px Arial`;
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🙂', segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2);
            }
        } else {
            ctx.fillStyle = `hsl(${(index * 20) % 360}, 70%, 50%)`;
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
        }
    });
    // Draw food
    if (food) {
        ctx.font = `${GRID_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.emoji, food.x + GRID_SIZE/2, food.y + GRID_SIZE/2);
    }
}

function checkCollision(head) {
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

function setOverlayStates(isGameRunning, isGameOver) {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (!isGameRunning && !isGameOver) {
        startBtn.style.display = 'inline-block';
        pauseBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        gameOverOverlay.classList.remove('active');
    } else if (isGameRunning && !isGameOver) {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        restartBtn.style.display = 'inline-block';
        gameOverOverlay.classList.remove('active');
    } else if (isGameOver) {
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        gameOverOverlay.classList.add('active');
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('newHighScore').style.display = 'block';
    } else {
        document.getElementById('newHighScore').style.display = 'none';
    }
    document.getElementById('finalScore').textContent = score;
    setOverlayStates(false, true);
}

function startGame() {
    score = 0;
    isGameOver = false;
    isPaused = false;
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    document.getElementById('newHighScore').style.display = 'none';
    document.getElementById('finalScore').textContent = '0';
    document.getElementById('score').textContent = '0';
    document.getElementById('highScore').textContent = highScore;
    setOverlayStates(true, false);
    initGame();
}

function restartGame() {
    clearInterval(gameLoop);
    startGame();
}

function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.innerHTML = isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('highScore').textContent = highScore;
    setOverlayStates(false, false);
});

document.addEventListener('keydown', (event) => {
    if (isPaused || isGameOver) return;
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'DOWN') nextDirection = 'UP';
            break;
        case 'ArrowDown':
            if (direction !== 'UP') nextDirection = 'DOWN';
            break;
        case 'ArrowLeft':
            if (direction !== 'RIGHT') nextDirection = 'LEFT';
            break;
        case 'ArrowRight':
            if (direction !== 'LEFT') nextDirection = 'RIGHT';
            break;
        case ' ':
            togglePause();
            break;
    }
});

document.getElementById('upBtn').addEventListener('click', () => {
    if (direction !== 'DOWN') nextDirection = 'UP';
});
document.getElementById('downBtn').addEventListener('click', () => {
    if (direction !== 'UP') nextDirection = 'DOWN';
});
document.getElementById('leftBtn').addEventListener('click', () => {
    if (direction !== 'RIGHT') nextDirection = 'LEFT';
});
document.getElementById('rightBtn').addEventListener('click', () => {
    if (direction !== 'LEFT') nextDirection = 'RIGHT';
});
