// ===== GAME CONFIG =====
const config = {
    canvasWidth: 800,
    canvasHeight: 400,
    playerSize: 30,
    playerColor: '#00ffff',
    obstacleColor: '#ff0055',
    groundLevel: 320,
    gravity: 0.6,
    jumpPower: 12,
    gameSpeed: 5,
    maxSpeed: 12
};

// ===== GAME STATE =====
let gameRunning = true;
let score = 0;
let gameSpeed = config.gameSpeed;

// ===== CANVAS SETUP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size based on container
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== PLAYER OBJECT =====
const player = {
    x: 50,
    y: config.groundLevel,
    size: config.playerSize,
    velocityY: 0,
    isJumping: false,
    
    jump() {
        if (!this.isJumping) {
            this.velocityY = -config.jumpPower;
            this.isJumping = true;
        }
    },
    
    update() {
        // Apply gravity
        this.velocityY += config.gravity;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y + this.size >= config.groundLevel) {
            this.y = config.groundLevel;
            this.velocityY = 0;
            this.isJumping = false;
        }
    },
    
    draw() {
        ctx.fillStyle = config.playerColor;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.shadowColor = 'transparent';
    },
    
    checkCollision(obstacle) {
        return !(this.x + this.size < obstacle.x || 
                 this.x > obstacle.x + obstacle.width ||
                 this.y + this.size < obstacle.y ||
                 this.y > obstacle.y + obstacle.height);
    }
};

// ===== OBSTACLES ARRAY =====
let obstacles = [];

class Obstacle {
    constructor() {
        this.width = 30 + Math.random() * 20;
        this.height = 50 + Math.random() * 50;
        this.x = canvas.width;
        this.y = config.groundLevel - this.height;
        this.speed = gameSpeed;
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw() {
        ctx.fillStyle = config.obstacleColor;
        ctx.shadowColor = 'rgba(255, 0, 85, 0.7)';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowColor = 'transparent';
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// ===== SPAWN OBSTACLE =====
let spawnTimer = 0;
let spawnRate = 80;

function spawnObstacle() {
    spawnTimer++;
    if (spawnTimer > spawnRate) {
        obstacles.push(new Obstacle());
        spawnTimer = 0;
        // Increase difficulty: spawn faster as score goes up
        spawnRate = Math.max(50, 80 - Math.floor(score / 500) * 5);
    }
}

// ===== COLLISION DETECTION =====
function checkCollisions() {
    for (let obstacle of obstacles) {
        if (player.checkCollision(obstacle)) {
            gameRunning = false;
            showGameOver();
        }
    }
}

// ===== SCORE SYSTEM =====
function updateScore() {
    obstacles = obstacles.filter(obs => {
        if (obs.x + obs.width < player.x && !obs.scored) {
            obs.scored = true;
            score += 10;
            gameSpeed = Math.min(config.maxSpeed, config.gameSpeed + score / 200);
            return true;
        }
        return true;
    });
    document.getElementById('score').textContent = score;
}

// ===== GAME OVER =====
function showGameOver() {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameoverScreen').style.display = 'flex';
}

// ===== DRAW BACKGROUND =====
function drawBackground() {
    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(1, '#0a0e27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground line
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, config.groundLevel);
    ctx.lineTo(canvas.width, config.groundLevel);
    ctx.stroke();
    ctx.setLineDash([]);
}

// ===== MAIN GAME LOOP =====
function gameLoop() {
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Update
    player.update();
    spawnObstacle();
    
    obstacles.forEach(obs => {
        obs.update();
        if (obs.isOffScreen()) {
            obstacles = obstacles.filter(o => o !== obs);
        }
    });
    
    checkCollisions();
    updateScore();
    
    // Draw
    drawBackground();
    player.draw();
    obstacles.forEach(obs => obs.draw());
    
    requestAnimationFrame(gameLoop);
}

// ===== INPUT HANDLING =====
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        player.jump();
    }
});

canvas.addEventListener('click', () => {
    player.jump();
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    player.jump();
});

// ===== START GAME =====
gameLoop();
