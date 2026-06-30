import { useEffect, useRef } from 'react';

const STAR_COUNT = 70;

export default function StarfieldCanvas({ heroId = 'hero' }: { heroId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;

    let w = 0;
    let h = 0;
    type Star = { x: number; y: number; r: number; tw: number; sp: number };
    let stars: Star[] = [];

    function resize() {
      w = canvas!.width = hero!.offsetWidth;
      h = canvas!.height = hero!.offsetHeight;
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.6,
          r: Math.random() * 1.2 + 0.2,
          tw: Math.random() * Math.PI * 2,
          sp: 0.02 + Math.random() * 0.04,
        });
      }
    }

    resize();

    let raf = 0;
    let visible = true;
    let pageVisible = !document.hidden;

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.tw += s.sp;
        const a = ((Math.sin(s.tw) + 1) / 2) * 0.9 + 0.1;
        ctx.fillStyle = `rgba(255, 240, 210, ${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (raf || !visible || !pageVisible) return;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible) start();
        else stop();
      },
      { rootMargin: '100px' },
    );
    io.observe(hero);

    function onVisibilityChange() {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    }

    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [heroId]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-90"
    />
  );
}
