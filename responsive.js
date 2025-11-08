// ajusta canvas para o container e devicePixelRatio; aplica limites por breakpoint
(function(){
    const debounce = (fn, ms=100) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

    function getCanvasAspect(canvas){
        // permite override via atributo data-aspect="16/9" ou data-original-width/data-original-height
        const da = canvas.getAttribute('data-aspect');
        if (da) {
            const parts = da.split('/');
            if (parts.length === 2) return Number(parts[0]) / Number(parts[1]) || (16/9);
            const n = parseFloat(da);
            if (!isNaN(n)) return n;
        }
        const ow = canvas.getAttribute('data-original-width');
        const oh = canvas.getAttribute('data-original-height');
        if (ow && oh) return Number(ow) / Number(oh);
        // fallback padrão 16:9
        return 16 / 9;
    }

    function fitCanvas(canvas){
        if (!canvas) return;
        // prefer parent quadroNegro / canvas-wrap for sizing
        const container = canvas.closest('.quadroNegro') || canvas.parentElement || document.documentElement;
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // breakpoints adjustments
        const is1366 = window.innerWidth >= 1200 && window.innerWidth < 1400 && window.innerHeight <= 820;
        const is1920 = window.innerWidth >= 1920;

        const maxW = is1366 ? 900 : (is1920 ? 1400 : rect.width);
        const targetCssWidth = Math.min(rect.width, maxW);

        // calcula altura preservando aspect ratio do canvas
        const aspect = getCanvasAspect(canvas);
        const targetCssHeight = Math.min(rect.height, Math.round(targetCssWidth / aspect));

        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.round(targetCssWidth * dpr));
        const h = Math.max(1, Math.round(targetCssHeight * dpr));

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = targetCssWidth + 'px';
            canvas.style.height = targetCssHeight + 'px';
            const ctx = canvas.getContext('2d');
            if (ctx && ctx.setTransform) ctx.setTransform(dpr,0,0,dpr,0,0);
            if (typeof drawShapes === 'function') try { drawShapes(); } catch(e){}
        }
    }

    function fitAll(){
        document.querySelectorAll('canvas').forEach(c => fitCanvas(c));
    }

    const onResize = debounce(fitAll,150);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('load', fitAll);
    document.addEventListener('DOMContentLoaded', fitAll);

    // observe layout changes
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(debounce(fitAll,150));
        document.querySelectorAll('.quadroNegro, .canvas-wrap, canvas, .bgFase1').forEach(el => ro.observe(el));
    }
})();