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

// inicializa 3 formas (quadrado, triângulo, círculo) na fase 2
window.addEventListener('load', () => {
    if (typeof initShapePainter !== 'function') {
        console.error('drawShapes.js não encontrado. Inclua drawShapes.js antes deste script.');
        return;
    }

    initShapePainter({
        canvasId: 'drawCanvas',
        colorBtnSelector: '.color-btn',
        defaultColor: '#222',
        shapes: [
            // quadrado (x,y = topo esquerdo)
            { type: 'square', x: 120, y: 120, size: 160, color: '#ffffff' },
            // triângulo (x,y = vértice superior)
            { type: 'triangle', x: 360, y: 300, size: 160, color: '#ffffff' },
            // círculo (x,y = centro)
            { type: 'circle', x: 720, y: 180, r: 80, color: '#ffffff' }
        ]
    });
});
