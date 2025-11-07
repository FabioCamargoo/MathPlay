const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let brushColor = "#dddddd";

// Formas geométricas com posição e cor
const shapes = [
        // curva S em pé (iniciando no topo e descendo)
    // points: [x0,y0, cx1,cy1, cx2,cy2, x1,y1]
    { type: 'scurve', points: [300, 80, 100, 200, 500, 360, 300, 520], strokeWidth: 12, color: "#fff" },
    // ellipse existente
    { type: 'ellipse', x: 200, y: 200, rx: 120, ry: 150, color: "#fff" }


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
        } else if (shape.type === 'ellipse') {
            ctx.beginPath();
            // usar ctx.ellipse para desenhar oval
            ctx.ellipse(shape.x, shape.y, shape.rx, shape.ry, 0, 0, 2 * Math.PI);
            ctx.fillStyle = shape.color;
            ctx.fill();
            ctx.strokeStyle = "#f5f5f5ff";
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (shape.type === 'scurve') {
            // desenha curva em S usando Path2D (cubic Bézier)
            const p = shape.points;
            const path = new Path2D();
            path.moveTo(p[0], p[1]);
            path.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
            ctx.lineWidth = shape.strokeWidth || 6;
            ctx.strokeStyle = shape.color;
            ctx.lineCap = 'round';
            ctx.stroke(path);
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
        } else if (shape.type === 'ellipse') {
            // ponto dentro da elipse: ((dx/rx)^2 + (dy/ry)^2) <= 1
            const dx = x - shape.x;
            const dy = y - shape.y;
            if ((dx * dx) / (shape.rx * shape.rx) + (dy * dy) / (shape.ry * shape.ry) <= 1) {
                shape.color = brushColor;
            }
        } else if (shape.type === 'scurve') {
            // usa Path2D e isPointInStroke para detectar clique próximo à curva
            const p = shape.points;
            const path = new Path2D();
            path.moveTo(p[0], p[1]);
            path.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
            ctx.lineWidth = shape.strokeWidth || 6;
            if (ctx.isPointInStroke(path, x, y)) {
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
        } else if (shape.type === 'ellipse') {
            const dx = x - shape.x;
            const dy = y - shape.y;
            if ((dx * dx) / (shape.rx * shape.rx) + (dy * dy) / (shape.ry * shape.ry) <= 1) {
                draggingShape = shape;
                offsetX = x - shape.x;
                offsetY = y - shape.y;
                return;
            }
        } else if (shape.type === 'scurve') {
            const p = shape.points;
            const path = new Path2D();
            path.moveTo(p[0], p[1]);
            path.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
            ctx.lineWidth = shape.strokeWidth || 6;
            if (ctx.isPointInStroke(path, x, y)) {
                // inicia arrasto: guarda posição inicial do mouse e cópia dos pontos
                draggingShape = shape;
                draggingShape._dragStart = { x, y, origPoints: shape.points.slice() };
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
    } else if (draggingShape.type === 'ellipse') {
        draggingShape.x = x - offsetX;
        draggingShape.y = y - offsetY;
    } else if (draggingShape.type === 'scurve') {
        // atualiza todos os pontos com o deslocamento desde o início do arrasto
        const ds = draggingShape._dragStart;
        const dx = x - ds.x;
        const dy = y - ds.y;
        draggingShape.points = ds.origPoints.map((v, idx) => (idx % 2 === 0 ? v + dx : v + dy));
    }
    drawShapes();
});

canvas.addEventListener('mouseup', () => {
    if (draggingShape && draggingShape._dragStart) delete draggingShape._dragStart;
    draggingShape = null;
});

canvas.addEventListener('mouseleave', () => {
    if (draggingShape && draggingShape._dragStart) delete draggingShape._dragStart;
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
