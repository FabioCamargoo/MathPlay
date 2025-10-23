window.addEventListener('load', () => {
    initShapePainter({
        canvasId: 'drawCanvas',
        colorBtnSelector: '.color-btn',
        defaultColor: '#222',
        shapes: [
            { type: 'square', x: 160, y: 160, size: 140, color: '#ffffff' },
            { type: 'square', x: 360, y: 140, size: 160, color: '#ffffff' },
            { type: 'triangle', x: 600, y: 280, size: 150, color: '#ffffff' }
        ]
    });
});