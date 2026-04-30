import { useEffect, useRef } from 'react';

export default function StarfieldCanvas({ heroId = 'hero' }: { heroId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const ctx = canvas.getContext('2d')!;

    let w = 0;
    let h = 0;
    type Star = { x: number; y: number; r: number; tw: number; sp: number };
    let stars: Star[] = [];

    function resize() {
      w = canvas!.width = hero!.offsetWidth;
      h = canvas!.height = hero!.offsetHeight;
      stars = [];
      for (let i = 0; i < 140; i++) {
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
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [heroId]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-90"
    />
  );
}
