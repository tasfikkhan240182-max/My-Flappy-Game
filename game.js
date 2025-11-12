const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const birdImg = new Image();
birdImg.src = 'assets/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

let birdY = 250;
let birdVelocity = 0;
const gravity = 0.5;       // 👈 একটু ধীর গতি (আগে ছিল 0.8)
const jump = -8;
let pipes = [];
let score = 0;
let gameOver = false;
let pipeTimer = 0;
const pipeInterval = 90;   // frames between pipes
const pipeSpeed = 4;       // pipe movement speed
const pipeGap = 180;       // wider gap between pipes

document.addEventListener('keydown', () => {
  if (!gameOver) birdVelocity = jump;
});

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
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  birdVelocity += gravity;
  birdY += birdVelocity;

  if (birdY < 0) birdY = 0;
  if (birdY + 40 > canvas.height) {
    gameOver = true;
    alert("Game Over! Final Score: " + score);
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
      gameOver = true;
      alert("Game Over! Final Score: " + score);
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

pipeImg.onload = () => {
  birdImg.onload = () => {
    update();
  };
};