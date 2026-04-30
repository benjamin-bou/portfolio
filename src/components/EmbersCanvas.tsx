import { useEffect, useRef } from 'react';

export default function EmbersCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let w = 0;
    let h = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; hue: number };
    const particles: P[] = [];

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function makeParticle(): P {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.3 - Math.random() * 0.6,
        r: 0.6 + Math.random() * 1.6,
        life: 0,
        max: 200 + Math.random() * 300,
        hue: 18 + Math.random() * 22,
      };
    }

    resize();
    for (let i = 0; i < 60; i++) {
      const p = makeParticle();
      p.y = Math.random() * h;
      particles.push(p);
    }

    let raf = 0;
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.life * 0.01) * 0.2;
        p.y += p.vy;
        p.life++;
        const a = Math.max(0, 1 - p.life / p.max) * 0.8;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${a})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, ${a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        if (p.life > p.max || p.y < -20) particles[i] = makeParticle();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[2] pointer-events-none mix-blend-screen opacity-85"
    />
  );
}
