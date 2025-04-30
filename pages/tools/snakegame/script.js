// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const snakeSize = 20;
let snake = [{x: 100, y: 100}]; // Snake initial position
let food = {x: 200, y: 200}; // Food initial position
let direction = 'RIGHT';
let score = 0;
let gameOver = false;

// Update the game state
function updateGame() {
  if (gameOver) return;
  
  // Move the snake
  const head = {...snake[0]}; // Copy the head
  if (direction === 'UP') head.y -= snakeSize;
  if (direction === 'DOWN') head.y += snakeSize;
  if (direction === 'LEFT') head.x -= snakeSize;
  if (direction === 'RIGHT') head.x += snakeSize;
  
  snake.unshift(head); // Add new head at the front
  
  // Check if the snake eats the food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    food = getRandomFoodPosition(); // Generate new food
  } else {
    snake.pop(); // Remove the tail if no food was eaten
  }

  // Check for collisions
  if (checkCollisions()) {
    gameOver = true;
    alert('Game Over! Your score is: ' + score);
  }

  drawGame();
}

// Draw the game state
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  
  // Draw the snake
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? 'green' : 'lime'; // Head of the snake is green, body is lime
    ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
  });

  // Draw the food
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, snakeSize, snakeSize);

  // Draw the score
  document.getElementById('score').innerText = 'Score: ' + score;
}

// Get random position for food
function getRandomFoodPosition() {
  const x = Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize;
  const y = Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize;
  return {x, y};
}

// Check for collisions with walls or self
function checkCollisions() {
  const head = snake[0];
  
  // Check if snake hits walls
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }

  // Check if snake hits itself
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

// Listen for keyboard input to control the snake
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
  if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
  if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
  if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
});

// Start the game loop
function gameLoop() {
  updateGame();
  setTimeout(gameLoop, 100); // Update every 100ms
}

gameLoop();
