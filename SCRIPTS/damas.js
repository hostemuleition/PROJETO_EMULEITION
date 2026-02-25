const tabuleiroHTML = document.getElementById('tabuleiro');
const statusTexto = document.getElementById('status');
let pecaSelecionada = null;
let turno = 'vermelha'; // 'vermelha' ou 'preta-peca'

// Representação do tabuleiro (8x8)
// 0: vazio, 1: vermelha, 2: preta, 11: dama vermelha, 22: dama preta
let mapa = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
];

function criarTabuleiro() {
    tabuleiroHTML.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const casa = document.createElement('div');
            casa.className = `casa ${(r + c) % 2 === 0 ? 'branca' : 'preta'}`;
            casa.dataset.row = r;
            casa.dataset.col = c;
            
            const pecaValor = mapa[r][c];
            if (pecaValor !== 0) {
                const peca = document.createElement('div');
                const corClas = (pecaValor === 1 || pecaValor === 11) ? 'vermelha' : 'preta-peca';
                peca.className = `peca ${corClas} ${pecaValor > 10 ? 'dama' : ''}`;
                
                if (pecaSelecionada && pecaSelecionada.r === r && pecaSelecionada.c === c) {
                    peca.classList.add('selecionada');
                }

                peca.onclick = () => selecionarPeca(r, c);
                casa.appendChild(peca);
            }

            casa.onclick = (e) => {
                if (e.target.classList.contains('casa')) moverPara(r, c);
            };

            tabuleiroHTML.appendChild(casa);
        }
    }
}

function selecionarPeca(r, c) {
    const pecaCor = (mapa[r][c] === 1 || mapa[r][c] === 11) ? 'vermelha' : 'preta-peca';
    if (pecaCor !== turno) return;

    pecaSelecionada = { r, c };
    criarTabuleiro();
}

function moverPara(r, c) {
    if (!pecaSelecionada) return;

    const origem = pecaSelecionada;
    const pecaValor = mapa[origem.r][origem.c];
    const ehDama = pecaValor > 10;
    
    const distR = r - origem.r;
    const distC = c - origem.c;
    const absR = Math.abs(distR);
    const absC = Math.abs(distC);

    // 1. Verificar se o movimento é na diagonal e a casa destino está vazia
    if (absR !== absC || mapa[r][c] !== 0) return;

    const dirR = distR / absR; // Direção da linha (1 ou -1)
    const dirC = distC / absC; // Direção da coluna (1 ou -1)

    // 2. Lógica para Peça Comum (Curta distância)
    if (!ehDama) {
        if (absR === 1) {
            // Só avança
            if (pecaValor === 1 && distR > 0) return; 
            if (pecaValor === 2 && distR < 0) return;
            efetuarMovimento(origem.r, origem.c, r, c);
        } 
        else if (absR === 2) {
            // Captura simples
            const meioR = origem.r + dirR;
            const meioC = origem.c + dirC;
            if (podeCapturar(meioR, meioC)) {
                mapa[meioR][meioC] = 0;
                efetuarMovimento(origem.r, origem.c, r, c);
            }
        }
    } 
    // 3. Lógica para Dama (Longa distância)
    else {
        let pecasNoCaminho = 0;
        let casaCapturada = null;

        // Percorre todas as casas no trajeto da diagonal
        for (let i = 1; i < absR; i++) {
            let atualR = origem.r + (i * dirR);
            let atualC = origem.c + (i * dirC);
            
            if (mapa[atualR][atualC] !== 0) {
                // Se encontrar uma peça...
                const corPeca = (mapa[atualR][atualC] === 1 || mapa[atualR][atualC] === 11) ? 'vermelha' : 'preta-peca';
                if (corPeca === turno) return; // Não pode pular a própria peça
                
                pecasNoCaminho++;
                casaCapturada = { r: atualR, c: atualC };
            }
        }

        if (pecasNoCaminho === 0) {
            // Movimento livre (voo da dama)
            efetuarMovimento(origem.r, origem.c, r, c);
        } else if (pecasNoCaminho === 1) {
            // Captura à distância
            mapa[casaCapturada.r][casaCapturada.c] = 0;
            efetuarMovimento(origem.r, origem.c, r, c);
        }
    }
}

function podeCapturar(r, c) {
    const oponente = mapa[r][c];
    if (oponente === 0) return false;
    const corOponente = (oponente === 1 || oponente === 11) ? 'vermelha' : 'preta-peca';
    return corOponente !== turno;
}

function efetuarMovimento(or, oc, nr, nc) {
    let valor = mapa[or][oc];
    
    // Transforma em dama ao chegar no fim
    if (nr === 0 && valor === 1) valor = 11;
    if (nr === 7 && valor === 2) valor = 22;

    mapa[nr][nc] = valor;
    mapa[or][oc] = 0;
    pecaSelecionada = null;
    
    trocarTurno();
    criarTabuleiro();
}

function trocarTurno() {
    turno = (turno === 'vermelha') ? 'preta-peca' : 'vermelha';
    statusTexto.innerText = `Vez das ${turno === 'vermelha' ? 'Vermelhas' : 'Pretas'}`;
    statusTexto.style.color = (turno === 'vermelha') ? '#d32f2f' : '#fff';
}

function resetarJogo() {
    location.reload();
}

criarTabuleiro();