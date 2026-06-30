import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 28;

export default function EmbersCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;

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
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = makeParticle();
      p.y = Math.random() * h;
      particles.push(p);
    }

    let raf = 0;
    let running = !document.hidden;

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.life * 0.01) * 0.2;
        p.y += p.vy;
        p.life++;
        const a = Math.max(0, 1 - p.life / p.max) * 0.7;
        // Soft glow via radial gradient (cheaper than shadowBlur over many particles)
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, `hsla(${p.hue}, 90%, 65%, ${a})`);
        glow.addColorStop(1, `hsla(${p.hue}, 90%, 65%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        if (p.life > p.max || p.y < -20) particles[i] = makeParticle();
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (raf || !running) return;
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function onVisibilityChange() {
      running = !document.hidden;
      if (running) start();
      else stop();
    }

    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[2] pointer-events-none mix-blend-screen opacity-85"
    />
  );
}
