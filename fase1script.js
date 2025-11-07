const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let brushColor = "#dddddd";

// Formas geométricas com posição e cor
const shapes = [
    { type: 'circle', x: 200, y: 200, r: 60, color: "#fff" },
    { type: 'square', x: 400, y: 150, size: 120, color: "#fff" },
    { type: 'triangle', x: 700, y: 250, size: 120, color: "#fff" }
];

// Drag and drop variables
let draggingShape = null;
let offsetX = 0;
let offsetY = 0;

// Função para desenhar todas as formas
function drawShapes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => {
        if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.r, 0, 2 * Math.PI);
            ctx.fillStyle = shape.color;
            ctx.fill();
            ctx.strokeStyle = "#f5f5f5ff";
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (shape.type === 'square') {
            ctx.beginPath();
            ctx.rect(shape.x, shape.y, shape.size, shape.size);
            ctx.fillStyle = shape.color;
            ctx.fill();
            ctx.strokeStyle = "#f5f5f5ff";
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (shape.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.size, shape.y);
            ctx.lineTo(shape.x + shape.size / 2, shape.y - shape.size);
            ctx.closePath();
            ctx.fillStyle = shape.color;
            ctx.fill();
            ctx.strokeStyle = "#f5f5f5ff";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });
}

// Lógica do seletor de cores
const colorBtns = document.querySelectorAll('.color-btn');
colorBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        brushColor = this.getAttribute('data-color');
        colorBtns.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
    });
});
colorBtns[0].classList.add('selected');

// Detecta clique em uma forma e pinta com a cor selecionada
canvas.addEventListener('click', (e) => {
    if (draggingShape) return; // Não pinta enquanto arrasta
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shapes.forEach(shape => {
        if (shape.type === 'circle') {
            const dist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (dist <= shape.r) {
                shape.color = brushColor;
            }
        } else if (shape.type === 'square') {
            if (
                x >= shape.x &&
                x <= shape.x + shape.size &&
                y >= shape.y &&
                y <= shape.y + shape.size
            ) {
                shape.color = brushColor;
            }
        } else if (shape.type === 'triangle') {
            // Algoritmo de ponto dentro do triângulo
            const x1 = shape.x, y1 = shape.y;
            const x2 = shape.x + shape.size, y2 = shape.y;
            const x3 = shape.x + shape.size / 2, y3 = shape.y - shape.size;
            function area(x1, y1, x2, y2, x3, y3) {
                return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
            }
            const A = area(x1, y1, x2, y2, x3, y3);
            const A1 = area(x, y, x2, y2, x3, y3);
            const A2 = area(x1, y1, x, y, x3, y3);
            const A3 = area(x1, y1, x2, y2, x, y);
            if (Math.abs(A - (A1 + A2 + A3)) < 0.5) {
                shape.color = brushColor;
            }
        }
    });
    drawShapes();
});

// Drag and drop handlers
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = shapes.length - 1; i >= 0; i--) { // Prioriza forma superior
        const shape = shapes[i];
        if (shape.type === 'circle') {
            const dist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (dist <= shape.r) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        } else if (shape.type === 'square') {
            if (
                x >= shape.x &&
                x <= shape.x + shape.size &&
                y >= shape.y &&
                y <= shape.y + shape.size
            ) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        } else if (shape.type === 'triangle') {
            const x1 = shape.x, y1 = shape.y;
            const x2 = shape.x + shape.size, y2 = shape.y;
            const x3 = shape.x + shape.size / 2, y3 = shape.y - shape.size;
            function area(x1, y1, x2, y2, x3, y3) {
                return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
            }
            const A = area(x1, y1, x2, y2, x3, y3);
            const A1 = area(x, y, x2, y2, x3, y3);
            const A2 = area(x1, y1, x, y, x3, y3);
            const A3 = area(x1, y1, x2, y2, x, y);
            if (Math.abs(A - (A1 + A2 + A3)) < 0.5) {
                draggingShape = shape;
                // Para triângulo, calcula offset do ponto de arrasto para o vértice superior
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggingShape) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingShape.type === 'circle') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    } else if (draggingShape.type === 'square') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    } else if (draggingShape.type === 'triangle') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    }
    drawShapes();
});

canvas.addEventListener('mouseup', () => {
    draggingShape = null;
});

canvas.addEventListener('mouseleave', () => {
    draggingShape = null;
});

// Inicializa as formas
drawShapes();

// chamar a função genérica com as formas desta fase
window.addEventListener('load', () => {
    // certifique-se que exista <canvas id="drawCanvas"> no HTML e que drawShapes.js foi incluído antes deste script
    initShapePainter({
        canvasId: 'drawCanvas',
        colorBtnSelector: '.color-btn',
        defaultColor: '#dddddd',
        shapes: [
            { type: 'circle', x: 150, y: 140, r: 50, color: '#ffffff' },
            { type: 'square', x: 320, y: 110, size: 100, color: '#ffffff' },
            { type: 'triangle', x: 500, y: 180, size: 110, color: '#ffffff' }
        ]
    });
});

// botão de áudio: play/pause simples
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio-fase1');
    const btn = document.getElementById('audioToggle');
    if (!audio || !btn) return;

    // garantir acessibilidade
    btn.type = 'button';

    function setPlayingState(isPlaying) {
        btn.classList.toggle('playing', isPlaying);
        btn.setAttribute('aria-pressed', String(Boolean(isPlaying)));
        btn.querySelector('.audio-label').textContent = isPlaying ? 'Pausar' : 'Som';
    }

    btn.addEventListener('click', () => {
        // reinicia outros áudios se necessário (procura elementos <audio> na página)
        document.querySelectorAll('audio').forEach(a => {
            if (a !== audio) { try { a.pause(); a.currentTime = 0; } catch (e) {} }
        });

        if (audio.paused) {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && playPromise.then) {
                playPromise.then(() => setPlayingState(true)).catch(() => { /* erro silencioso */ });
            } else {
                setPlayingState(true);
            }
        } else {
            audio.pause();
            audio.currentTime = 0;
            setPlayingState(false);
        }
    });

    // quando terminar, atualizar estado do botão
    audio.addEventListener('ended', () => setPlayingState(false));
})();

// garante que o botão de áudio toque o som (robusto, com fallback)
(function () {
    // tenta obter o <audio> do DOM; se não existir cria um Audio() como fallback
    const audioEl = document.getElementById('audio-fase1') || new Audio('audio/fase1.mp3');
    const btn = document.getElementById('audioToggle');

    if (!btn) return;

    btn.type = 'button'; // garante que não envie formulários
    // função que atualiza visual do botão
    function setPlayingState(isPlaying) {
        btn.classList.toggle('playing', isPlaying);
        btn.setAttribute('aria-pressed', String(Boolean(isPlaying)));
        const label = btn.querySelector('.audio-label');
        if (label) label.textContent = isPlaying ? 'Pausar' : 'Som';
    }

    btn.addEventListener('click', () => {
        // pausa outros áudios na página
        document.querySelectorAll('audio').forEach(a => {
            if (a !== audioEl) { try { a.pause(); a.currentTime = 0; } catch (e) {} }
        });

        // garante que o audio não esteja mudo
        try { audioEl.muted = false; audioEl.volume = audioEl.volume || 1; } catch (e) {}

        // sempre tenta tocar (reinicia do início)
        try {
            audioEl.currentTime = 0;
            const p = audioEl.play();
            if (p && p.then) {
                p.then(() => setPlayingState(true)).catch(() => { /* erro silencioso */ });
            } else {
                // browsers antigos que não retornam promise
                setPlayingState(true);
            }
        } catch (err) {
            /* erro silencioso */
        }
    });

    // quando terminar, volta ao estado inicial
    try {
        audioEl.addEventListener && audioEl.addEventListener('ended', () => setPlayingState(false));
    } catch (e) {}
})();

// bloco para tocar áudio do botão (coloque no final do arquivo)
(function () {
    const btn = document.getElementById('audioToggle');
    const audioEl = document.getElementById('audio-fase1');

    if (!btn || !audioEl) return;

    // ao clicar, usa o data-audio do botão para definir o src e tocar
    btn.addEventListener('click', () => {
        // caminho do áudio que você quer tocar (relativo à pasta MathPlay)
        const src = btn.getAttribute('data-audio') || audioEl.src;
        if (!src) {
            return;
        }

        // configura o src se necessário
        if (audioEl.src !== src && !audioEl.src.endsWith(src)) {
            audioEl.src = src;
            try { audioEl.load(); } catch (e) {}
        }

        // pausa outros áudios na página
        document.querySelectorAll('audio').forEach(a => {
            if (a !== audioEl) { try { a.pause(); a.currentTime = 0; } catch (e) {} }
        });

        // reproduz (gesture do usuário — não deve ser bloqueado)
        audioEl.currentTime = 0;
        audioEl.play().then(() => {
            btn.classList.add('playing');
            const label = btn.querySelector('.audio-label');
            if (label) label.textContent = 'Pausar';
        }).catch(() => { /* erro silencioso */ });
    });
})();

// garante que as formas permaneçam visíveis quando o áudio for tocado/pausado/terminar
(function () {
    const btn = document.getElementById('audioToggle');
    const audioEl = document.getElementById('audio-fase1');

    if (!audioEl) return;

    function safeDraw() {
        try {
            if (typeof drawShapes === 'function') drawShapes();
        } catch (err) {
            console.warn('Erro ao redesenhar shapes:', err);
        }
    }

    // redesenha em eventos do áudio
    audioEl.addEventListener('play', safeDraw);
    audioEl.addEventListener('pause', safeDraw);
    audioEl.addEventListener('ended', safeDraw);

    // redesenha logo após clique (pequeno atraso para garantir que play() inicie)
    if (btn) {
        btn.addEventListener('click', () => {
            setTimeout(safeDraw, 50);
        });
    }
})();

/* Conexão botão <-> áudio */
(function () {
    const btn = document.getElementById('audioToggle');
    const audioEl = document.getElementById('audio-fase1');

    if (!btn) return;

    // se audio existe no data-audio do botão, usa isso como src (fallback)
    const dataSrc = btn.getAttribute('data-audio');
    if (audioEl && dataSrc && (!audioEl.src || audioEl.src.endsWith('/'))) {
        audioEl.src = dataSrc;
    }

    function setPlayingState(isPlaying) {
        btn.classList.toggle('playing', isPlaying);
        btn.setAttribute('aria-pressed', String(Boolean(isPlaying)));
        const label = btn.querySelector('.audio-label');
        if (label) label.textContent = isPlaying ? 'Pausar' : 'Som';
        // redesenha as formas para garantir que continuem visíveis
        if (typeof drawShapes === 'function') setTimeout(drawShapes, 30);
    }

    btn.addEventListener('click', () => {
        // encontra ou atualiza elemento de áudio (se não existir, cria)
        let a = audioEl;
        if (!a) {
            const src = btn.getAttribute('data-audio');
            if (!src) { return; }
            a = new Audio(src);
        }

        // pausa outros áudios na página
        document.querySelectorAll('audio').forEach(x => {
            if (x !== a) { try { x.pause(); x.currentTime = 0; } catch (e) {} }
        });

        // toggle play/pause (reinicia sempre no início)
        if (a.paused) {
            a.currentTime = 0;
            const p = a.play();
            if (p && p.then) {
                p.then(() => setPlayingState(true)).catch(() => { /* erro silencioso */ });
            } else {
                setPlayingState(true);
            }
        } else {
            a.pause();
            a.currentTime = 0;
            setPlayingState(false);
        }

        // ensure draw after click
        if (typeof drawShapes === 'function') setTimeout(drawShapes, 50);
    });

    if (audioEl) audioEl.addEventListener('ended', () => setPlayingState(false));
})();
