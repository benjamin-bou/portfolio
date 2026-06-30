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
    if (!layers.length) return;

    let raf = 0;
    let pageVisible = !document.hidden;

    function tick() {
      const vh = window.innerHeight;
      let anyVisible = false;
      layers.forEach((layer) => {
        const rect = layer.parent.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        anyVisible = true;
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        layer.target = progress * rect.height * layer.speed * -0.5;
        layer.current += (layer.target - layer.current) * 0.12;
        layer.el.style.transform = `translate3d(0, ${layer.current.toFixed(2)}px, 0)`;
      });
      if (!anyVisible) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (!raf && pageVisible) raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function onScroll() {
      start();
    }
    function onVisibilityChange() {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    start();

    return () => {
      stop();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
