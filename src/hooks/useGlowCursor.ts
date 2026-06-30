import { useEffect } from 'react';

export function useGlowCursor() {
  useEffect(() => {
    const cursor = document.getElementById('glow-cursor');
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let raf = 0;
    let pageVisible = !document.hidden;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!raf && pageVisible) raf = requestAnimationFrame(tick);
    };

    function tick() {
      curX += (mouseX - curX) * 0.1;
      curY += (mouseY - curY) * 0.1;
      cursor!.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%)`;
      // Stop when settled — rAF restarts on next mouse move.
      if (Math.abs(mouseX - curX) < 0.5 && Math.abs(mouseY - curY) < 0.5) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function onVisibilityChange() {
      pageVisible = !document.hidden;
      if (!pageVisible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    window.addEventListener('mousemove', onMove);
    document.addEventListener('visibilitychange', onVisibilityChange);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
