window.onload = function() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score-board');

    let score = 0;
    let gameActive = true;
    let animationId;
    let frames = 0; // Contador de frames para controlar a dificuldade

    const player = {
        x: 50,
        y: 200,
        width: 40,
        height: 40,
        color: "#00d4ff",
        dy: 0,
        jumpForce: 12,
        gravity: 0.6,
        grounded: false
    };

    let obstacles = [];
    
    // Configurações de Dificuldade Inicial
    let obstacleSpawnRate = 100; // Quanto menor, mais rápido aparecem
    let baseSpeed = 5;

    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.shadowBlur = 0;
    }

    function createObstacle() {
        let size = Math.random() * 40 + 30;
        // A velocidade aumenta com base no score
        let currentSpeed = baseSpeed + (score * 0.2); 
        
        obstacles.push({
            x: canvas.width,
            y: canvas.height - size,
            width: 30,
            height: size,
            speed: currentSpeed
        });
    }

    function update() {
        if (!gameActive) return;

        frames++;

        // FÍSICA DO JOGADOR
        player.dy += player.gravity;
        player.y += player.dy;

        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.dy = 0;
            player.grounded = true;
        }

        // DIFICULDADE PROGRESSIVA
        // A cada 5 pontos, os obstáculos aparecem mais rápido (mínimo de 40 frames)
        let dynamicSpawnRate = Math.max(40, obstacleSpawnRate - Math.floor(score / 2) * 5);

        if (frames % dynamicSpawnRate === 0) {
            createObstacle();
        }

        // LÓGICA DOS OBSTÁCULOS
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= obs.speed;

            // Colisão
            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                player.y < obs.y + obs.height &&
                player.y + player.height > obs.y
            ) {
                gameActive = false;
                cancelAnimationFrame(animationId);
                alert("GAME OVER! A Host Emuleition desafia-te a bater os teus " + score + " pontos!");
                return;
            }

            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
                score++;
                if(scoreElement) scoreElement.innerText = "Pontos: " + score;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        
        ctx.fillStyle = "#ff0055";
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });

        update();
        if (gameActive) {
            animationId = requestAnimationFrame(draw);
        }
    }

    function jump() {
        if (player.grounded && gameActive) {
            player.dy = -player.jumpForce;
            player.grounded = false;
        }
    }

    window.addEventListener('keydown', (e) => { 
        if (e.code === 'Space') {
            e.preventDefault();
            jump(); 
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        jump();
    });

    draw();
};

function resetGame() {
    location.reload();
}