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

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    function tick() {
      curX += (mouseX - curX) * 0.1;
      curY += (mouseY - curY) * 0.1;
      cursor!.style.transform = `translate(${curX}px,${curY}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
}
