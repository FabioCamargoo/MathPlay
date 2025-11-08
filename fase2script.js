function fitCanvasToViewport() {
    const canvas = document.getElementById('drawCanvas');
    if (!canvas) return;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(cssH * dpr));
    // aplica tamanho visual via estilo (já definido no CSS como 100vw/100vh)
    // re-render das formas após ajuste
    if (typeof drawShapes === 'function') drawShapes();
}
window.addEventListener('load', fitCanvasToViewport);
window.addEventListener('resize', fitCanvasToViewport);

const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let brushColor = "#dddddd";

// Formas geométricas com posição e cor
const shapes = [
    { type: 'circle', x: 200, y: 200, r: 40, color: "#fff" },
    // substituído square por rect (retângulo em pé)
    { type: 'rect', x: 400, y: 180, width: 80, height: 300, color: "#fff" },
    { type: 'triangle', x: 700, y: 250, size: 85,  color: "#fff" }
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
        } else if (shape.type === 'rect') {
            ctx.beginPath();
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            ctx.fillStyle = shape.color;
            ctx.fill();
            ctx.strokeStyle = "#f5f5f5ff";
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (shape.type === 'triangle') {
            ctx.beginPath();
            // base: (x, y) -> (x + size, y)
            // ponta invertida: vértice abaixo em (x + size/2, y + size)
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.size, shape.y);
            ctx.lineTo(shape.x + shape.size / 2, shape.y + shape.size);
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
if (colorBtns[0]) colorBtns[0].classList.add('selected');

// Detecta clique em uma forma e pinta com a cor selecionada
canvas.addEventListener('click', (e) => {
    if (draggingShape) return; // Não pinta enquanto arrasta
    const rectCanvas = canvas.getBoundingClientRect();
    const x = e.clientX - rectCanvas.left;
    const y = e.clientY - rectCanvas.top;

    shapes.forEach(shape => {
        if (shape.type === 'circle') {
            const dist = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
            if (dist <= shape.r) {
                shape.color = brushColor;
            }
        } else if (shape.type === 'rect') {
            if (
                x >= shape.x &&
                x <= shape.x + shape.width &&
                y >= shape.y &&
                y <= shape.y + shape.height
            ) {
                shape.color = brushColor;
            }
        } else if (shape.type === 'triangle') {
            // Algoritmo de ponto dentro do triângulo (ponta para baixo)
            const x1 = shape.x, y1 = shape.y;
            const x2 = shape.x + shape.size, y2 = shape.y;
            const x3 = shape.x + shape.size / 2, y3 = shape.y + shape.size; // invertido
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
    const rectCanvas = canvas.getBoundingClientRect();
    const x = e.clientX - rectCanvas.left;
    const y = e.clientY - rectCanvas.top;

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
        } else if (shape.type === 'rect') {
            if (
                x >= shape.x &&
                x <= shape.x + shape.width &&
                y >= shape.y &&
                y <= shape.y + shape.height
            ) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        } else if (shape.type === 'triangle') {
            const x1 = shape.x, y1 = shape.y;
            const x2 = shape.x + shape.size, y2 = shape.y;
            const x3 = shape.x + shape.size / 2, y3 = shape.y + shape.size; // invertido
            function area(x1, y1, x2, y2, x3, y3) {
                return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
            }
            const A = area(x1, y1, x2, y2, x3, y3);
            const A1 = area(x, y, x2, y2, x3, y3);
            const A2 = area(x1, y1, x, y, x3, y3);
            const A3 = area(x1, y1, x2, y2, x, y);
            if (Math.abs(A - (A1 + A2 + A3)) < 0.5) {
                draggingShape = shape;
                // Para triângulo, calcula offset do ponto de arrasto para o vértice (use índice do vértice superior esquerdo)
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!draggingShape) return;
    const rectCanvas = canvas.getBoundingClientRect();
    const x = e.clientX - rectCanvas.left;
    const y = e.clientY - rectCanvas.top;

    if (draggingShape.type === 'circle') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    } else if (draggingShape.type === 'rect') {
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
            // aqui também trocar para rect (retângulo em pé)
            { type: 'rect', x: 320, y: 90, width: 80, height: 160, color: '#ffffff' },
            { type: 'triangle', x: 500, y: 180, size: 110, color: '#ffffff' }
        ]
    });
});

/* bloco para conectar botão <-> áudio na fase 2 */
(function () {
    const btn = document.getElementById('audioToggle2');
    const audioEl = document.getElementById('audio-fase2');
    if (!btn || !audioEl) return;

    function setPlayingState(isPlaying) {
        btn.classList.toggle('playing', isPlaying);
        btn.setAttribute('aria-pressed', String(Boolean(isPlaying)));
        const label = btn.querySelector('.audio-label');
        if (label) label.textContent = isPlaying ? 'Pausar' : 'Som';
        if (typeof drawShapes === 'function') setTimeout(drawShapes, 30);
    }

    btn.addEventListener('click', () => {
        // pausa outros áudios
        document.querySelectorAll('audio').forEach(a => {
            if (a !== audioEl) { try { a.pause(); a.currentTime = 0; } catch (e) {} }
        });

        // toggle play/pause
        try {
            audioEl.currentTime = 0;
            const p = audioEl.play();
            if (p && p.then) {
                p.then(() => setPlayingState(true)).catch(() => { /* erro silencioso */ });
            } else {
                setPlayingState(true);
            }
        } catch (e) {
            // fallback: criar Audio se <audio> falhar
            try {
                const src = btn.getAttribute('data-audio') || 'audio/fase2.mp3';
                const a = new Audio(src);
                a.play().then(() => setPlayingState(true)).catch(() => {});
                a.addEventListener('ended', () => setPlayingState(false));
            } catch (err) {}
        }
    });

    audioEl.addEventListener('ended', () => setPlayingState(false));
})();
