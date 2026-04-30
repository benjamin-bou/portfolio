import { useEffect, useRef } from 'react';
import StarfieldCanvas from './StarfieldCanvas';

const WORDS = [
  { text: "J'aime", em: false },
  { text: 'apprendre', em: true },
  { text: 'et', em: false },
  { text: 'construire', em: true },
  { text: 'des', em: false },
  { text: 'produits', em: false },
  { text: 'web', em: false },
  { text: 'qui', em: false },
  { text: 'servent.', em: false },
];

export default function Hero() {
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Animated stat counters
  useEffect(() => {
    const els = counterRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLSpanElement;
          const target = parseInt(el.dataset.count || '0', 10);
          const dur = 1400;
          const t0 = performance.now();
          function tick(now: number) {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.3 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scramble effect on em hover
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.hero-h1 em');
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const cleanups: (() => void)[] = [];
    els.forEach((el) => {
      const original = el.textContent || '';
      let running = false;
      const onEnter = () => {
        if (running) return;
        running = true;
        let frame = 0;
        const id = setInterval(() => {
          frame++;
          el.textContent = original
            .split('')
            .map((c, i) => {
              if (frame > i + 4) return original[i];
              if (c === ' ') return ' ';
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
          if (frame > original.length + 4) {
            clearInterval(id);
            el.textContent = original;
            running = false;
          }
        }, 40);
      };
      el.addEventListener('mouseenter', onEnter);
      cleanups.push(() => el.removeEventListener('mouseenter', onEnter));
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <section
      id="hero"
      className="hero relative overflow-hidden flex items-end max-md:items-start"
      style={{
        minHeight: '100svh',
        padding:
          'clamp(90px, 14vh, 130px) clamp(24px, 5vw, 80px) clamp(60px, 10vh, 120px)',
      }}
    >
      <div id="hero-sky" className="hero-sky" />
      <div className="hero-photo" />
      <StarfieldCanvas heroId="hero" />
      <div className="hero-stars" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div id="hero-sun" className="hero-sun" />
      <div className="hero-horizon" />
      <div className="hero-ridge" />

      <div className="relative z-[2] max-w-[1400px] mx-auto w-full md:pr-[min(480px,38vw)]">
        <div className="fade-up-eyebrow flex items-center gap-3.5 mb-7 text-[11px] uppercase tracking-[0.35em] text-orange-hot eyebrow-rule" />

        <h1 className="hero-h1">
          {WORDS.map((w, i) => (
            <span key={i} className={`word w${i + 1}`}>
              {w.em ? <em>{w.text}</em> : w.text}
              {i < WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <div className="fade-up-delayed flex justify-between items-end mt-15 gap-10 flex-wrap">
          <p className="max-w-[46ch] text-sm leading-[1.7] text-cream/80">
            Étudiant à Epitech, alternant chez{' '}
            <strong className="text-orange-hot font-medium">Spayr</strong>. J'aime
            construire des <em className="italic">produits complets</em>, de l'idée à la
            mise en ligne. Je m'intéresse et m'adapte aux nouvelles technologies qui
            dessinent le développement de demain.
          </p>
          <div className="scroll-hint flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-cream/60">
            Scroll · la suite
          </div>
        </div>

        <div className="fade-up-stats flex gap-10 flex-wrap mt-10">
          <Stat n="5" count setRef={(el) => (counterRefs.current[0] = el)} label="années de code" />
          <Stat n="12" count setRef={(el) => (counterRefs.current[1] = el)} label="projets livrés" />
          <Stat n="2" count setRef={(el) => (counterRefs.current[2] = el)} label="alternances" />
          <Stat n="∞" label="envie d'apprendre" />
        </div>
      </div>
    </section>
  );
}

function Stat({
  n,
  count,
  setRef,
  label,
}: {
  n: string;
  count?: boolean;
  setRef?: (el: HTMLSpanElement | null) => void;
  label: string;
}) {
  return (
    <div className="border-l border-orange-hot/30 pl-[18px]">
      <span
        ref={setRef}
        data-count={count ? n : undefined}
        className="font-serif text-[32px] italic text-orange-hot leading-none block"
      >
        {count ? '0' : n}
      </span>
      <span className="text-[10px] uppercase tracking-[0.25em] text-cream/60 mt-1.5 block">
        {label}
      </span>
    </div>
  );
}
