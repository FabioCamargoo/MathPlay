/* Reutilizável: initShapePainter(options)
   options.canvasId, options.colorBtnSelector, options.defaultColor, options.shapes (array)
*/
(function () {
    function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
        const area = (ax, ay, bx, by, cx, cy) => Math.abs((ax*(by-cy) + bx*(cy-ay) + cx*(ay-by)) / 2.0);
        const A = area(x1,y1,x2,y2,x3,y3);
        const A1 = area(px,py,x2,y2,x3,y3);
        const A2 = area(x1,y1,px,py,x3,y3);
        const A3 = area(x1,y1,x2,y2,px,py);
        return Math.abs(A - (A1 + A2 + A3)) < 0.5;
    }

    window.initShapePainter = function initShapePainter(options = {}) {
        const canvas = document.getElementById(options.canvasId || 'drawCanvas');
        if (!canvas) { console.warn('initShapePainter: canvas not found:', options.canvasId); return null; }
        const ctx = canvas.getContext('2d');
        let brushColor = options.defaultColor || '#222';
        let shapes = JSON.parse(JSON.stringify(options.shapes || []));
        const colorBtnSelector = options.colorBtnSelector || '.color-btn';
        let selectedIndex = -1;

        function drawShapes() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            shapes.forEach((shape, i) => {
                // estilo de destaque se selecionado
                const isSelected = (i === selectedIndex);
                if (shape.type === 'circle') {
                    ctx.beginPath();
                    ctx.arc(shape.x, shape.y, shape.r, 0, 2*Math.PI);
                    ctx.fillStyle = shape.color;
                    ctx.fill();
                    ctx.strokeStyle = isSelected ? '#000' : (shape.stroke || '#222');
                    ctx.lineWidth = isSelected ? (shape.lineWidth || 5) : (shape.lineWidth || 3);
                    ctx.stroke();
                } else if (shape.type === 'square') {
                    ctx.beginPath();
                    ctx.rect(shape.x, shape.y, shape.size, shape.size);
                    ctx.fillStyle = shape.color;
                    ctx.fill();
                    ctx.strokeStyle = isSelected ? '#000' : (shape.stroke || '#222');
                    ctx.lineWidth = isSelected ? (shape.lineWidth || 5) : (shape.lineWidth || 3);
                    ctx.stroke();
                } else if (shape.type === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(shape.x, shape.y);
                    ctx.lineTo(shape.x + shape.size, shape.y);
                    ctx.lineTo(shape.x + shape.size/2, shape.y - shape.size);
                    ctx.closePath();
                    ctx.fillStyle = shape.color;
                    ctx.fill();
                    ctx.strokeStyle = isSelected ? '#000' : (shape.stroke || '#222');
                    ctx.lineWidth = isSelected ? (shape.lineWidth || 5) : (shape.lineWidth || 3);
                    ctx.stroke();
                }
            });
        }

        // color picker hookup
        const colorBtns = document.querySelectorAll(colorBtnSelector);
        colorBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                brushColor = this.getAttribute('data-color') || brushColor;
                colorBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        if (colorBtns[0]) colorBtns[0].classList.add('selected');

        // paint on click + selection
        let draggingShape = null, offsetX = 0, offsetY = 0;

        canvas.addEventListener('click', (e) => {
            if (draggingShape) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            for (let i = shapes.length-1; i >= 0; i--) {
                const s = shapes[i];
                if (s.type === 'circle' && Math.hypot(x - s.x, y - s.y) <= s.r) { s.color = brushColor; drawShapes(); return; }
                if (s.type === 'square' && x >= s.x && x <= s.x + s.size && y >= s.y && y <= s.y + s.size) { s.color = brushColor; drawShapes(); return; }
                if (s.type === 'triangle') {
                    const x1=s.x,y1=s.y,x2=s.x+s.size,y2=s.y,x3=s.x+s.size/2,y3=s.y-s.size;
                    if (pointInTriangle(x,y,x1,y1,x2,y2,x3,y3)) { s.color = brushColor; drawShapes(); return; }
                }
            }
        });

        // select on double click (toggle)
        canvas.addEventListener('dblclick', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            selectedIndex = -1;
            for (let i = shapes.length-1; i >= 0; i--) {
                const s = shapes[i];
                if (s.type === 'circle' && Math.hypot(x - s.x, y - s.y) <= s.r) { selectedIndex = i; break; }
                if (s.type === 'square' && x >= s.x && x <= s.x + s.size && y >= s.y && y <= s.y + s.size) { selectedIndex = i; break; }
                if (s.type === 'triangle') {
                    const x1=s.x,y1=s.y,x2=s.x+s.size,y2=s.y,x3=s.x+s.size/2,y3=s.y-s.size;
                    if (pointInTriangle(x,y,x1,y1,x2,y2,x3,y3)) { selectedIndex = i; break; }
                }
            }
            drawShapes();
        });

        // drag handlers
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            for (let i = shapes.length -1; i >= 0; i--) {
                const s = shapes[i];
                if (s.type === 'circle' && Math.hypot(x - s.x, y - s.y) <= s.r) { draggingShape = s; offsetX = x - s.x; offsetY = y - s.y; return; }
                if (s.type === 'square' && x >= s.x && x <= s.x + s.size && y >= s.y && y <= s.y + s.size) { draggingShape = s; offsetX = x - s.x; offsetY = y - s.y; return; }
                if (s.type === 'triangle') {
                    const x1=s.x,y1=s.y,x2=s.x+s.size,y2=s.y,x3=s.x+s.size/2,y3=s.y-s.size;
                    if (pointInTriangle(x,y,x1,y1,x2,y2,x3,y3)) { draggingShape = s; offsetX = x - s.x; offsetY = y - s.y; return; }
                }
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!draggingShape) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left, y = e.clientY - rect.top;
            draggingShape.x = x - offsetX; draggingShape.y = y - offsetY;
            drawShapes();
        });

        const stopDrag = () => { draggingShape = null; };
        canvas.addEventListener('mouseup', stopDrag);
        canvas.addEventListener('mouseleave', stopDrag);

        drawShapes();

        return {
            getShapes: () => JSON.parse(JSON.stringify(shapes)),
            setShapes: (s) => { shapes = JSON.parse(JSON.stringify(s)); drawShapes(); },
            setBrushColor: (c) => { brushColor = c; },
            // novo: seleciona uma forma (por índice)
            selectShape: (index) => { selectedIndex = (typeof index === 'number' ? index : -1); drawShapes(); },
            // novo: ajusta tamanho/raio da forma selecionada ou índice específico
            setShapeSize: (index, value) => {
                const i = (typeof index === 'number') ? index : selectedIndex;
                if (i == null || i < 0 || i >= shapes.length) return;
                const s = shapes[i];
                if (s.type === 'circle') s.r = Math.max(5, Number(value));
                else if (s.type === 'square') s.size = Math.max(8, Number(value));
                else if (s.type === 'triangle') s.size = Math.max(8, Number(value));
                drawShapes();
            }
        };
    };
})();