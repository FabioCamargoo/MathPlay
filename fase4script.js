const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let brushColor = "#dddddd";

// Formas geométricas com posição e cor
const shapes = [
    
    { type: 'circle', x: 200, y: 200, r: 25, color: "#fff" },
    // trocado square por rect (retângulo em pé)
   
    
    // adicionados 3 círculos
    { type: 'circle', x: 280, y: 320, r: 30, color: "#fff" },
    { type: 'circle', x: 520, y: 320, r: 28, color: "#fff" },
    { type: 'circle', x: 640, y: 120, r: 27, color: "#fff" },
    { type: 'rect', x: 400, y: 120, width: 240, height: 120, color: "#fff" }
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
if (colorBtns[0]) colorBtns[0].classList.add('selected');

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

function pointInTriangle(px, py, t) {
    const x1 = t.x, y1 = t.y;
    const x2 = t.x + t.size, y2 = t.y;
    const x3 = t.x + t.size / 2, y3 = t.y - t.size;
    function area(ax, ay, bx, by, cx, cy) {
        return Math.abs((ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2);
    }
    const A = area(x1, y1, x2, y2, x3, y3);
    const A1 = area(px, py, x2, y2, x3, y3);
    const A2 = area(x1, y1, px, py, x3, y3);
    const A3 = area(x1, y1, x2, y2, px, py);
    return Math.abs(A - (A1 + A2 + A3)) < 0.5;
}

function isPointInShape(shape, x, y) {
    if (shape.type === 'circle') {
        const dist = Math.hypot(x - shape.x, y - shape.y);
        return dist <= shape.r;
    }
    if (shape.type === 'rect') {
        return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
    }
    if (shape.type === 'triangle') {
        return pointInTriangle(x, y, shape);
    }
    return false;
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggingShape) {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
        drawShapes();
        canvas.style.cursor = 'grabbing';
        return;
    }

    // hover feedback quando não está arrastando
    const over = shapes.some(s => isPointInShape(s, x, y));
    canvas.style.cursor = over ? 'grab' : 'default';
});

canvas.addEventListener('mouseup', () => {
    draggingShape = null;
    canvas.style.cursor = 'default';
});

canvas.addEventListener('mouseleave', () => {
    draggingShape = null;
});

// Inicializa as formas
drawShapes();

// Removido initShapePainter para evitar conflito com o arraste desta fase

function fitCanvasToContainer() {
    const canvas = document.getElementById('drawCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;

    // tamanho CSS exibido
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // backing store (resolução) para ficar nítido no dispositivo
    canvas.width = Math.round(cssW * ratio);
    canvas.height = Math.round(cssH * ratio);

    // define transformação para mapear unidades CSS -> pixels do backing store
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // redesenha suas formas (chame sua função de desenho)
    if (typeof drawShapes === 'function') drawShapes();
}

// executar no load e resize
window.addEventListener('load', () => {
    fitCanvasToContainer();
    // se você inicializa shapes aqui, faça depois de ajustar canvas
});
window.addEventListener('resize', () => {
    fitCanvasToContainer();
});
/* conecta botão de áudio (audioToggle4) ao <audio id="audio-fase4"> e trata caminhos com '&' */
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('audioToggle4');
        let audioEl = document.getElementById('audio-fase4');
        if (!btn) return;

        // pega caminho preferencial (data-audio > src do <audio> > fallback)
        const rawPath = (btn.getAttribute('data-audio') || (audioEl && audioEl.getAttribute('src')) || 'audio/fase4.mp3').trim();
        const src = encodeURI(rawPath);

        // garante elemento <audio>
        if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.id = 'audio-fase4';
            audioEl.preload = 'auto';
            document.body.appendChild(audioEl);
        }
        if (!audioEl.src || !audioEl.src.endsWith(src)) {
            audioEl.src = src;
            try { audioEl.load(); } catch (e) {}
        }

        btn.type = 'button';
        function setPlayingState(isPlaying) {
            btn.classList.toggle('playing', isPlaying);
            btn.setAttribute('aria-pressed', String(Boolean(isPlaying)));
            const label = btn.querySelector('.audio-label');
            if (label) label.textContent = isPlaying ? 'Pausar' : 'Som';
            if (typeof drawShapes === 'function') setTimeout(drawShapes, 30);
        }

        btn.addEventListener('click', async () => {
            // pausa outros áudios na página
            document.querySelectorAll('audio').forEach(a => { if (a !== audioEl) try { a.pause(); a.currentTime = 0; } catch (_) {} });

            try {
                if (audioEl.paused) {
                    audioEl.currentTime = 0;
                    const p = audioEl.play();
                    if (p && p.then) await p;
                    setPlayingState(true);
                } else {
                    audioEl.pause();
                    audioEl.currentTime = 0;
                    setPlayingState(false);
                }
            } catch (err) {
                // fallback: tentar com new Audio()
                try {
                    const a = new Audio(src);
                    a.preload = 'auto';
                    a.currentTime = 0;
                    await a.play();
                    setPlayingState(true);
                    a.addEventListener('ended', () => setPlayingState(false));
                } catch (_) {
                    // silencioso — se não tocar, verifique o caminho/network (F12 → Network)
                }
            }
        });

        audioEl.addEventListener('ended', () => setPlayingState(false));
    });
})();
