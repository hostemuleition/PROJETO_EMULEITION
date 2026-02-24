let canvas, ctx, statusTexto;
let p1, p2, door, platforms = [], hazards = [];
let gameActive = false, faseAtual = 0;
const gravity = 0.8;
const keysPressed = {};


// Função para atualizar o menu visual (aqueles botões de fase do seu HTML)
function atualizarMenuVisual() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    const unlockedLevels = parseInt(localStorage.getItem('faseSalva')) || 0;
    menuContainer.innerHTML = '';

    for (let i = 0; i < 20; i++) {
        const btn = document.createElement('div');
        btn.innerText = i + 1;
        // Se a fase for menor ou igual à salva, ela está desbloqueada
        const isUnlocked = i <= unlockedLevels;
        btn.className = `btn-fase ${isUnlocked ? 'unlocked' : ''} ${i === faseAtual ? 'active' : ''}`;
        
        if (isUnlocked) {
            btn.onclick = () => carregarFase(i);
        }
        menuContainer.appendChild(btn);
    }
}

function obterConfigFase(n) {
    let config = {
        p1Start: { x: 30, y: 300 },
        p2Start: { x: 70, y: 300 },

function obterConfigFase(n) {
    let config = {
        p1Start: { x: 20, y: 350 },
        p2Start: { x: 60, y: 350 },
        door: { x: 720, y: 300 },
        plats: [],
        hazards: []
    };

    const layouts = [
        // Fase 1: Chão reto e degrau
        { plats: [{x:0, y:380, w:800, h:20}, {x:600, y:300, w:200, h:20}], door: {x:720, y:240} },
        // Fase 2: Bloco Gigante central
    // Design manual para garantir que NADA falte para passar
    const layouts = [
        // Fase 1: Chão reto e degrau
        { plats: [{x:0, y:380, w:800, h:20}, {x:600, y:300, w:200, h:20}], door: {x:720, y:240} },
        // Fase 2: O Bloco Gigante central (ajustado para ser impossível errar)
        { plats: [{x:0, y:380, w:150, h:20}, {x:200, y:320, w:400, h:40}, {x:650, y:380, w:150, h:20}], hazards: [{x:150, y:390, w:500, h:10}], door: {x:700, y:320} },
        // Fase 3: Escada de precisão
        { plats: [{x:0, y:380, w:100, h:20}, {x:150, y:300, w:100, h:20}, {x:300, y:220, w:100, h:20}, {x:500, y:220, w:100, h:20}, {x:700, y:150, w:100, h:20}], hazards: [{x:100, y:395, w:700, h:10}], door: {x:720, y:90} },
        // Fase 4: Zig Zag
        { plats: [{x:0, y:380, w:200, h:20}, {x:300, y:300, w:200, h:20}, {x:100, y:220, w:200, h:20}, {x:400, y:140, w:400, h:20}], door: {x:700, y:80} }
    ];


    // Se a fase for maior que os layouts manuais, gera uma segura automaticamente
    if (n < layouts.length) {
        config.plats = layouts[n].plats.map(p => ({x: p.x, y: p.y, width: p.w, height: p.h}));
        config.hazards = (layouts[n].hazards || []).map(h => ({x: h.x, y: h.y, width: h.w, height: h.h}));
        config.door = layouts[n].door;
    } else {

        // CORREÇÃO FASES 5+: Garante plataforma de spawn fixa para os personagens
        config.plats = [
            { x: 0, y: 350, width: 120, height: 30 }, // PLATAFORMA DE SPAWN FIXA
            { x: 180, y: 300, width: 100, height: 20 },
            { x: 340, y: 240, width: 100, height: 20 },
            { x: 500, y: 180, width: 100, height: 20 },
            { x: 660, y: 250, width: 140, height: 20 }
        ];
        
        // Adiciona variação de altura conforme o nível sobe
        config.plats.slice(1).forEach(p => p.y += (n % 4) * 15);
        // Gerador de fases 5 a 20: Garante blocos a cada 150px (alcance do pulo)
        config.plats = [
            { x: 0, y: 380, width: 100, height: 20 },
            { x: 150, y: 300, width: 120, height: 20 },
            { x: 320, y: 220, width: 120, height: 20 },
            { x: 490, y: 140, width: 120, height: 20 },
            { x: 660, y: 140, width: 140, height: 20 }
        ];
        // Move a altura dos blocos levemente a cada fase para dar variedade
        config.plats.forEach(p => p.y += (n % 5) * 10);
        config.door = { x: 720, y: config.plats[4].y - 60 };
    }
    
    return config;
}

window.onload = function() {
    canvas = document.getElementById('coop-canvas');
    ctx = canvas.getContext('2d');
    statusTexto = document.getElementById('status');
    
    window.addEventListener('keydown', (e) => { keysPressed[e.code] = true; });
    window.addEventListener('keyup', (e) => { keysPressed[e.code] = false; });

    carregarFase(parseInt(localStorage.getItem('faseSalva')) || 0);
    draw();
};

function carregarFase(n) {
    faseAtual = n;
    const config = obterConfigFase(n);


    // Ajustamos o spawn para cair exatamente na primeira plataforma
    p1 = { x: config.p1Start.x, y: config.p1Start.y, width: 25, height: 25, color: "#00d4ff", dy: 0, dx: 0, speed: 5, jumpForce: 13, grounded: false, inDoor: false, keys: { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' } };
    p2 = { x: config.p2Start.x, y: config.p2Start.y, width: 25, height: 25, color: "#ff0055", dy: 0, dx: 0, speed: 5, jumpForce: 13, grounded: false, inDoor: false, keys: { up: 'KeyW', left: 'KeyA', right: 'KeyD' } };

    p1 = { x: config.p1Start.x, y: config.p1Start.y, width: 25, height: 25, color: "#32cd32", dy: 0, dx: 0, speed: 5, jumpForce: 13, grounded: false, inDoor: false, keys: { up: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' } };
    p2 = { x: config.p2Start.x, y: config.p2Start.y, width: 25, height: 25, color: "#a200ff", dy: 0, dx: 0, speed: 5, jumpForce: 13, grounded: false, inDoor: false, keys: { up: 'KeyW', left: 'KeyA', right: 'KeyD' } };
    
    door = { ...config.door, width: 50, height: 60 };
    platforms = config.plats;
    hazards = config.hazards;
    
    statusTexto.innerText = `Nível ${n + 1}`;

    statusTexto.style.color = "#00d4ff";
    gameActive = true;
    atualizarMenuVisual();

    statusTexto.style.color = "white";
    gameActive = true;

}

function morreu() {
    if (!gameActive) return;
    gameActive = false;
    statusTexto.innerText = "VOCÊ FOI MOGADO!";

    statusTexto.style.color = "#ff5555";
    statusTexto.style.color = "#ff0000";
    setTimeout(() => carregarFase(faseAtual), 1000);
}

function updatePlayer(p) {
    if (!gameActive) return;

    if (keysPressed[p.keys.left]) p.dx = -p.speed;
    else if (keysPressed[p.keys.right]) p.dx = p.speed;
    else p.dx = 0;

    if (keysPressed[p.keys.up] && p.grounded) { p.dy = -p.jumpForce; p.grounded = false; }

    p.dy += gravity;
    p.x += p.dx;
    p.y += p.dy;

    if (p.y > canvas.height) morreu();

    hazards.forEach(h => {
        if (p.x < h.x + h.width && p.x + p.width > h.x && p.y < h.y + h.height && p.y + p.height > h.y) morreu();
    });

    p.grounded = false;
    platforms.forEach(plat => {

        // Colisão simples por cima

        if (p.x < plat.x + plat.width && p.x + p.width > plat.x && p.y + p.height > plat.y && p.y + p.height < plat.y + 15 && p.dy >= 0) {
            p.y = plat.y - p.height;
            p.dy = 0;
            p.grounded = true;
        }
    });

    p.inDoor = (p.x < door.x + door.width && p.x + p.width > door.x && p.y < door.y + door.height && p.y + p.height > door.y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Desenhar Fundo (opcional, para dar profundidade)
    ctx.fillStyle = "#050505";
    ctx.fillRect(0,0, canvas.width, canvas.height);

    // Desenhar Porta
    ctx.fillStyle = (p1.inDoor && p2.inDoor) ? "#00ff00" : (p1.inDoor || p2.inDoor) ? "#ffff00" : "#333";
    ctx.fillRect(door.x, door.y, door.width, door.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(door.x, door.y, door.width, door.height);

    // Desenhar Obstáculos (Hazards)
    ctx.fillStyle = "#ff4500";
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));

    // Desenhar Plataformas

    // Porta (Amarela espera, Verde passa)
    ctx.fillStyle = (p1.inDoor && p2.inDoor) ? "#00ff00" : (p1.inDoor || p2.inDoor) ? "#ffff00" : "#555";
    ctx.fillRect(door.x, door.y, door.width, door.height);

    ctx.fillStyle = "#ff4500";
    hazards.forEach(h => ctx.fillRect(h.x, h.y, h.width, h.height));


    ctx.fillStyle = "white";
    platforms.forEach(plat => ctx.fillRect(plat.x, plat.y, plat.width, plat.height));

    if (gameActive) {
        updatePlayer(p1);
        updatePlayer(p2);

        if (p1.inDoor && p2.inDoor) {
            gameActive = false;
            statusTexto.innerText = "SINCRO PERFEITA!";

            statusTexto.style.color = "#00ff00";
            setTimeout(() => {
                if (faseAtual < 19) {
                    // Salva o progresso no localStorage se for a fase mais alta atingida
                    let salvo = parseInt(localStorage.getItem('faseSalva')) || 0;
                    if (faseAtual + 1 > salvo) {
                        localStorage.setItem('faseSalva', faseAtual + 1);
                    }

            setTimeout(() => {
                if (faseAtual < 19) {
                    localStorage.setItem('faseSalva', faseAtual + 1);
                    carregarFase(faseAtual + 1);
                } else {
                    statusTexto.innerText = "VOCÊS VENCERAM O JOGO!";
                }
            }, 1000);
        }
    }


    // Desenhar Jogadores


    ctx.fillStyle = p1.color; ctx.fillRect(p1.x, p1.y, p1.width, p1.height);
    ctx.fillStyle = p2.color; ctx.fillRect(p2.x, p2.y, p2.width, p2.height);

    requestAnimationFrame(draw);

}

// Funções para os botões do HTML
window.reiniciarFase = () => carregarFase(faseAtual);
window.limparProgresso = () => {
    if(confirm("Deseja resetar todo o progresso?")) {
        localStorage.clear();
        carregarFase(0);
    }
};

}
