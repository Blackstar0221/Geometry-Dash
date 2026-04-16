// ===== SIMPLE TEST VERSION =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = canvas.parentElement.clientWidth;
canvas.height = 400;

// Player
const player = {
    x: 50,
    y: 300,
    w: 30,
    h: 30,
    vy: 0,
    jumping: false,
    
    jump() {
        if (!this.jumping) {
            this.vy = -10;
            this.jumping = true;
            console.log("JUMP!");
        }
    },
    
    update() {
        this.vy += 0.6; // gravity
        this.y += this.vy;
        
        if (this.y >= 300) {
            this.y = 300;
            this.vy = 0;
            this.jumping = false;
        }
    },
    
    draw() {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
};

// Obstacles
let obstacles = [];
let spawnCounter = 0;

class Obstacle {
    constructor() {
        this.x = canvas.width;
        this.y = 280;
        this.w = 30;
        this.h = 40;
    }
    
    update() {
        this.x -= 5;
    }
    
    draw() {
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    
    isDone() {
        return this.x < -50;
    }
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground line
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 330);
    ctx.lineTo(canvas.width, 330);
    ctx.stroke();
    
    // Update player
    player.update();
    player.draw();
    
    // Spawn obstacles
    spawnCounter++;
    if (spawnCounter > 60) {
        obstacles.push(new Obstacle());
        spawnCounter = 0;
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();
        
        if (obstacles[i].isDone()) {
            obstacles.splice(i, 1);
        }
        
        // Simple collision
        if (player.x < obstacles[i].x + obstacles[i].w &&
            player.x + player.w > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].h &&
            player.y + player.h > obstacles[i].y) {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }
    
    // Draw score
    ctx.fillStyle = '#ffff00';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + obstacles.length, 20, 30);
    
    requestAnimationFrame(gameLoop);
}

// INPUT - SIMPLE VERSION
console.log("Game loaded! Try tapping or pressing SPACE");

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        player.jump();
    }
});

document.addEventListener('click', () => {
    player.jump();
});

document.addEventListener('touchstart', () => {
    player.jump();
});

// Start
gameLoop();
