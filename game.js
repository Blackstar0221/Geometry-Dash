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
        console.log("Jump called!");
        if (!this.isJumping) {
            this.velocityY = -config.jumpPower;
            this.isJumping = true;
            console.log("Jumped!");
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
        this.height = 25 + Math.random() * 25;
        this.x = canvas.width;
        this.y = config.groundLevel - this.height;
        this.speed = gameSpeed;
        this.scored = false;
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
    obstacles.forEach(obs => {
        if (obs.x + obs.width < player.x && !obs.scored) {
            obs.scored = true;
            score += 10;
            gameSpeed = Math.min(config.maxSpeed, config.gameSpeed + score / 200);
        }
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
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(1, '#0a0e27');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
    
    player.update();
    spawnObstacle();
    
    obstacles = obstacles.filter(obs => {
        obs.update();
        return !obs.isOffScreen();
    });
    
    checkCollisions();
    updateScore();
    
    drawBackground();
    player.draw();
    obstacles.forEach(obs => obs.draw());
    
    requestAnimationFrame(gameLoop);
}

// ===== INPUT HANDLING =====
function handleJump() {
    console.log("Jump input detected!");
    if (gameRunning) {
        player.jump();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleJump();
    }
});

window.addEventListener('click', () => {
    handleJump();
});

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

// ===== START GAME =====
gameLoop();
