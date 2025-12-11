const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const birdImg = new Image();
birdImg.src = 'assets/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

// Game variables
let birdY = 250;
let birdVelocity = 0;
const gravity = 0.5;      // slower fall
const jump = -8;
let pipes = [];
let score = 0;
let gameOver = false;
let pipeTimer = 0;
const pipeInterval = 145;
const pipeSpeed = 2.8;
const pipeGap = 240;
let gameStarted = false;
let countdown = 3;
let countdownActive = false;
let countdownInterval = null;

// Event listeners for PC + Mobile
document.addEventListener('keydown', handleInput);
document.addEventListener('touchstart', handleInput);
document.addEventListener('click', handleInput);

function handleInput(e) {
  if (!gameStarted && !countdownActive && !gameOver) {
    // প্রথমবার input এ countdown শুরু হবে
    startCountdown();
    // ✅ সাথে সাথে bird jump করবে
    birdVelocity = jump;
  } 
  else if (gameStarted && !gameOver) {
    birdVelocity = jump;
  } 
  else if (gameOver && (e.code === "Space" || e.code === "Enter" || e.type === "touchstart" || e.type === "click")) {
    resetGame();
  }
}

function startCountdown() {
  countdownActive = true;
  countdown = 3;

  countdownInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "60px sans-serif";
    ctx.fillText(countdown, canvas.width / 2 - 15, canvas.height / 2);
    countdown--;

    if (countdown < 0) {
      clearInterval(countdownInterval);
      countdownActive = false;
      gameStarted = true;
      update();
    }
  }, 1000);
}

function drawBird() {
  ctx.drawImage(birdImg, 50, birdY, 40, 40);
}

function drawPipe(pipe) {
  ctx.drawImage(pipeImg, pipe.x, 0, 60, pipe.top);
  ctx.drawImage(pipeImg, pipe.x, pipe.top + pipeGap, 60, canvas.height - pipe.top - pipeGap);
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  if (!gameStarted || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  birdVelocity += gravity;
  birdY += birdVelocity;

  if (birdY < 0) birdY = 0;
  if (birdY + 40 > canvas.height) {
    endGame();
    return;
  }

  pipeTimer++;
  if (pipeTimer >= pipeInterval) {
    const top = Math.floor(Math.random() * (canvas.height - pipeGap - 100)) + 50;
    pipes.push({ x: canvas.width, top, passed: false });
    pipeTimer = 0;
  }

  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;
    drawPipe(pipe);

    const birdBox = { x: 50, y: birdY, width: 40, height: 40 };
    const pipeTopBox = { x: pipe.x, y: 0, width: 60, height: pipe.top };
    const pipeBottomBox = {
      x: pipe.x,
      y: pipe.top + pipeGap,
      width: 60,
      height: canvas.height - pipe.top - pipeGap
    };

    if (isColliding(birdBox, pipeTopBox) || isColliding(birdBox, pipeBottomBox)) {
      endGame();
      return;
    }

    if (!pipe.passed && pipe.x + 60 < 50) {
      score++;
      pipe.passed = true;
    }
  });

  drawBird();

  ctx.fillStyle = "#fff";
  ctx.font = "32px sans-serif";
  ctx.fillText("Score: " + score, canvas.width / 2 - 50, 50);

  requestAnimationFrame(update);
}

function endGame() {
  gameOver = true;
  gameStarted = false;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px sans-serif";
  ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2 - 30);
  ctx.font = "28px sans-serif";
  ctx.fillText("Final Score: " + score, canvas.width / 2 - 90, canvas.height / 2 + 10);
  ctx.fillText("Tap or Press Space to Restart", canvas.width / 2 - 170, canvas.height / 2 + 50);
}

function resetGame() {
  clearInterval(countdownInterval);
  countdownActive = false;
  birdY = 250;
  birdVelocity = 0;
  pipes = [];
  score = 0;
  pipeTimer = 0;
  gameOver = false;
  gameStarted = false;
  startCountdown();
}

// Load images then show start message
pipeImg.onload = () => {
  birdImg.onload = () => {
    ctx.fillStyle = "#fff";
    ctx.font = "32px sans-serif";
    ctx.fillText("Tap or Press Any Key to Start", canvas.width / 2 - 180, canvas.height / 2);
  };
};

