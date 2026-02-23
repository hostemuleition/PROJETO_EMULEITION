const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-board');

let score = 0;
let gameActive = true;

// Propriedades do Jogador (Urso/Bloco Azul)
const player = {
    x: 50,
    y: 250,
    width: 40,
    height: 40,
    color: "#00d4ff",
    dy: 0,
    jumpForce: 12,
    gravity: 0.6,
    grounded: false
};

// Obstáculos
const obstacles = [];
let obstacleTimer = 0;

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
}

function createObstacle() {
    let size = Math.random() * 30 + 20;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - size,
        width: 25,
        height: size,
        speed: 6 + (score / 5) // Fica mais rápido com o tempo
    });
}

function update() {
    if (!gameActive) return;

    // Gravidade
    player.dy += player.gravity;
    player.y += player.dy;

    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    // Gerar obstáculos
    obstacleTimer++;
    if (obstacleTimer > 90) {
        createObstacle();
        obstacleTimer = 0;
    }

    // Mover obstáculos e checar colisão
    obstacles.forEach((obs, index) => {
        obs.x -= obs.speed;

        // Colisão
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            gameActive = false;
            alert("Fim de Jogo! Pontuação: " + score);
        }

        // Remover obstáculos que saíram da tela
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score++;
            scoreElement.innerText = "Pontos: " + score;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    
    // Desenhar obstáculos
    ctx.fillStyle = "#ff0055";
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    update();
    requestAnimationFrame(draw);
}

function jump() {
    if (player.grounded && gameActive) {
        player.dy = -player.jumpForce;
        player.grounded = false;
    }
}

function resetGame() {
    location.reload();
}

// Controles
window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
canvas.addEventListener('mousedown', jump);

draw();