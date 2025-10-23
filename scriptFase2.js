window.addEventListener('load', () => {
    initShapePainter({
        canvasId: 'drawCanvas',
        colorBtnSelector: '.color-btn',
        defaultColor: '#222',
        shapes: [
            { type: 'square', x: 150, y: 120, size: 180, color: '#ffffff' },
            { type: 'triangle', x: 380, y: 280, size: 160, color: '#ffffff' },
            { type: 'square', x: 600, y: 140, size: 120, color: '#ffffff' },
            { type: 'triangle', x: 800, y: 300, size: 120, color: '#ffffff' }
        ]
    });
});