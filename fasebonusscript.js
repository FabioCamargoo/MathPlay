const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let brushColor = "#dddddd"; // cor selecionada global

// Formas geométricas com posição e cor
const shapes = [
    // retângulo em pé (substitui o quadrado)
    { type: 'rect', x: 360, y: 120, width: 200, height: 300, color: "#fff" },
    // exemplo de outras formas (ajuste conforme seu arquivo)
    { type: 'circle', x: 200, y: 200, r: 60, color: "#fff" },
    { type: 'triangle', x: 700, y: 250, size: 210, color: "#fff" }
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
colorBtns[0].classList.add('selected');

// Detecta clique em uma forma e pinta com a cor selecionada
canvas.addEventListener('click', (e) => {
    if (draggingShape) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shapes.forEach(shape => {
        if (shape.type === 'circle') {
            const dist = Math.hypot(x - shape.x, y - shape.y);
            if (dist <= shape.r) shape.color = brushColor;
        } else if (shape.type === 'rect') {
            if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                shape.color = brushColor;
            }
        } else if (shape.type === 'triangle') {
            // ponto dentro do triângulo (mesma lógica anterior)
            const x1 = shape.x, y1 = shape.y;
            const x2 = shape.x + shape.size, y2 = shape.y;
            const x3 = shape.x + shape.size / 2, y3 = shape.y - shape.size;
            function area(x1, y1, x2, y2, x3, y3) {
                return Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2.0);
            }
            const A = area(x1,y1,x2,y2,x3,y3);
            const A1 = area(x,y,x2,y2,x3,y3);
            const A2 = area(x1,y1,x,y,x3,y3);
            const A3 = area(x1,y1,x2,y2,x,y);
            if (Math.abs(A - (A1+A2+A3)) < 0.5) shape.color = brushColor;
        }
    });

    drawShapes();
});

// handlers de arrastar (mousedown)
canvas.addEventListener('mousedown', (e) => {
    const rectB = canvas.getBoundingClientRect();
    const x = e.clientX - rectB.left;
    const y = e.clientY - rectB.top;

    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.type === 'circle') {
            const dist = Math.hypot(x - shape.x, y - shape.y);
            if (dist <= shape.r) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        } else if (shape.type === 'rect') {
            if (x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        } else if (shape.type === 'triangle') {
            // mesma checagem por área se necessário...
            const x1 = shape.x, y1 = shape.y;
            const x2 = shape.x + shape.size, y2 = shape.y;
            const x3 = shape.x + shape.size / 2, y3 = shape.y - shape.size;
            function area(x1, y1, x2, y2, x3, y3) {
                return Math.abs((x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2.0);
            }
            const A = area(x1,y1,x2,y2,x3,y3);
            const A1 = area(x,y,x2,y2,x3,y3);
            const A2 = area(x1,y1,x,y,x3,y3);
            const A3 = area(x1,y1,x2,y2,x,y);
            if (Math.abs(A - (A1+A2+A3)) < 0.5) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        }
    }
});

// mousemove para arrastar
canvas.addEventListener('mousemove', (e) => {
    if (!draggingShape) return;
    const rectB = canvas.getBoundingClientRect();
    const x = e.clientX - rectB.left;
    const y = e.clientY - rectB.top;

    if (draggingShape.type === 'circle') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    } else if (draggingShape.type === 'rect') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    } else if (draggingShape.type === 'triangle') {
        // mover triângulo inteiro pelo mesmo deslocamento
        const dx = x - offsetX - draggingShape.x;
        const dy = y - offsetY - draggingShape.y;
        draggingShape.x += dx;
        draggingShape.y += dy;
    }

    drawShapes();
});

canvas.addEventListener('mouseup', () => { draggingShape = null; });
canvas.addEventListener('mouseleave', () => { draggingShape = null; });

// Inicializa as formas
drawShapes();

function fitCanvasToViewport() {
    const canvas = document.getElementById('drawCanvas');
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // CSS size (fill viewport)
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    // backing store size for sharp rendering
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // redesenha se existir função de desenho
    if (typeof drawShapes === 'function') drawShapes();
    if (window.painter && typeof window.painter.setShapes === 'function') {
        const s = window.painter.getShapes();
        window.painter.setShapes(s);
    }
}

window.addEventListener('load', () => { 
    fitCanvasToViewport(); 
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
window.addEventListener('resize', fitCanvasToViewport);

/* conecta botão áudio (faseBonus) ao <audio id="audio-faseBonus"> */
(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('audioToggleBonus');
        let audioEl = document.getElementById('audio-faseBonus');
        if (!btn) return;

        const raw = (btn.getAttribute('data-audio') || (audioEl && audioEl.getAttribute('src')) || 'audio/faseBonus.mp3').trim();
        const src = encodeURI(raw);

        if (!audioEl) {
            audioEl = document.createElement('audio');
            audioEl.id = 'audio-faseBonus';
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
            } catch {
                try {
                    const a = new Audio(src);
                    a.preload = 'auto';
                    a.currentTime = 0;
                    await a.play();
                    setPlayingState(true);
                    a.addEventListener('ended', () => setPlayingState(false));
                } catch {}
            }
        });

        audioEl.addEventListener('ended', () => setPlayingState(false));
    });
})();
