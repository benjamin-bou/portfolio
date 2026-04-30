import { useEffect } from 'react';

export function useParallax() {
  useEffect(() => {
    const layers = Array.from(document.querySelectorAll<HTMLElement>('.parallax-bg')).map(
      (el) => ({
        el,
        parent: el.parentElement!,
        speed: parseFloat(el.dataset.parallax || '0.3'),
        current: 0,
        target: 0,
      }),
    );

    let raf = 0;
    function tick() {
      const vh = window.innerHeight;
      layers.forEach((layer) => {
        const rect = layer.parent.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const progress =
          (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        layer.target = progress * rect.height * layer.speed * -0.5;
        layer.current += (layer.target - layer.current) * 0.12;
        layer.el.style.transform = `translate3d(0, ${layer.current.toFixed(2)}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
