const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const birdImg = new Image();
birdImg.src = 'assets/bird.png';

const pipeImg = new Image();
pipeImg.src = 'assets/pipe.png';

// ================= GAME VARIABLES =================
let birdY = 250;
let birdVelocity = 0;

const gravity = 0.5;
const jump = -8;

let pipes = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let gameWon = false; 
let pipeTimer = 0;

// 📈 লেভেল ও গেম প্রগতি ট্র্যাকিং (যা মরলেও রিসেট হবে না)
let currentLevel = 1;
let levelStartScore = 0; // প্রতি লেভেলের শুরুর স্কোর (Checkpoint)
let pipeSpeed = 2.8;      
let pipeInterval = 145;   
const pipeGap = 240;

// Countdown
let countdown = 3;
let countdownActive = false;
let countdownInterval = null;

// 🔑 Restart control
let canRestart = false;

// ================= INPUT =================
document.addEventListener('keydown', (e) => {
  handleInput();
});

document.addEventListener('touchstart', (e) => {
  e.preventDefault(); 
  handleInput();
}, { passive: false });

document.addEventListener('click', (e) => {
  if (!('ontouchstart' in window)) {
    handleInput();
  }
});

function handleInput() {
  if (!gameStarted && !countdownActive && !gameOver && !gameWon) {
    startCountdown();
  } 
  else if (gameStarted && !gameOver && !gameWon) {
    birdVelocity = jump;
  } 
  // 🏆 ইউজার জিতলে ট্যাপ করলে পরের লেভেল শুরু হবে
  else if (gameWon && canRestart) {
    nextLevel();
  }
  // 💀 ইউজার মরলে ট্যাপ করলে ওই লেভেলের শুরু থেকে রিস্টার্ট হবে
  else if (gameOver && canRestart) {
    resetToCheckpoint();
  }
}

// ================= COUNTDOWN =================
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

// ================= DRAW =================
function drawBird() {
  ctx.drawImage(birdImg, 50, birdY, 40, 40);
}

function drawPipe(pipe) {
  ctx.drawImage(pipeImg, pipe.x, 0, 60, pipe.top);
  ctx.drawImage(
    pipeImg,
    pipe.x,
    pipe.top + pipeGap,
    60,
    canvas.height - pipe.top - pipeGap
  );
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ================= GAME LOOP =================
function update() {
  if (!gameStarted || gameOver || gameWon) return;

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
    const top = Math.floor(
      Math.random() * (canvas.height - pipeGap - 100)
    ) + 50;

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

    if (
      isColliding(birdBox, pipeTopBox) ||
      isColliding(birdBox, pipeBottomBox)
    ) {
      endGame();
      return;
    }

    if (!pipe.passed && pipe.x + 60 < 50) {
      score++;
      pipe.passed = true;

      // 🎯 চেক করছি লেভেল শেষ হয়েছে কি না (প্রতি ৫ স্কোরে লেভেল শেষ)
      if (score > 0 && score % 5 === 0) {
        winGame();
        return;
      }
    }
  });

  if (gameWon) return;

  drawBird();

  // 📊 স্কোর এবং লেভেল লাইভ দেখানো
  ctx.fillStyle = "#fff";
  ctx.font = "24px sans-serif";
  ctx.fillText("Score: " + score, 30, 40);
  ctx.fillText("Level: " + currentLevel, canvas.width - 120, 40);

  requestAnimationFrame(update);
}

// ================= 💀 GAME OVER (CHECKPOINT) =================
function endGame() {
  gameOver = true;
  gameStarted = false;
  canRestart = false;

  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px sans-serif";
  ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2 - 30);
  ctx.font = "24px sans-serif";
  ctx.fillText("Level " + currentLevel + " Failed", canvas.width / 2 - 75, canvas.height / 2 + 10);
  ctx.font = "20px sans-serif";
  ctx.fillText("Tap to Retry this Level", canvas.width / 2 - 100, canvas.height / 2 + 50);

  setTimeout(() => {
    canRestart = true;
  }, 500);
}

// ================= 🏆 WIN GAME (MID-LEVEL) =================
function winGame() {
  gameWon = true;
  gameStarted = false;
  canRestart = false;

  ctx.fillStyle = "rgba(0, 40, 0, 0.7)"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFD700"; 
  ctx.font = "40px sans-serif";
  ctx.fillText("You Win! 🎉", canvas.width / 2 - 95, canvas.height / 2 - 30);
  ctx.fillStyle = "#fff";
  ctx.font = "24px sans-serif";
  ctx.fillText("Level " + currentLevel + " Completed!", canvas.width / 2 - 110, canvas.height / 2 + 15);
  ctx.font = "20px sans-serif";
  ctx.fillText("Tap to Start Next Level", canvas.width / 2 - 100, canvas.height / 2 + 65);

  setTimeout(() => {
    canRestart = true;
  }, 600); 
}

// ================= 🆙 NEXT LEVEL LOGIC =================
function nextLevel() {
  currentLevel++; // লেভেল ১ বাড়বে
  levelStartScore = score; // নতুন চেকপয়েন্ট স্কোর সেট হলো
  
  // লেভেল বাড়ার কারণে স্পিড বৃদ্ধি ও পাইপের ব্যবধান কমানো
  pipeSpeed += 0.4; 
  pipeInterval = Math.max(85, pipeInterval - 12);

  gameWon = false;
  pipes = [];
  pipeTimer = 0;
  birdY = 250;
  birdVelocity = 0;
  
  startCountdown();
}

// ================= 🔄 RESET TO CHECKPOINT (NOT FIRST) =================
function resetToCheckpoint() {
  clearInterval(countdownInterval);
  countdownActive = false;
  
  // প্লেয়ার যে লেভেলে মরেছে সেই লেভেলের শুরুর স্কোরে ফিরে যাবে
  score = levelStartScore; 
  
  birdY = 250;
  birdVelocity = 0;
  pipes = [];
  pipeTimer = 0;
  gameOver = false;
  gameStarted = false;
  
  startCountdown();
}

// ================= START SCREEN =================
pipeImg.onload = () => {
  birdImg.onload = () => {
    ctx.fillStyle = "#fff";
    ctx.font = "32px sans-serif";
    ctx.fillText(
      "Tap or Press Any Key to Start",
      canvas.width / 2 - 190,
      canvas.height / 2
    );
  };
};