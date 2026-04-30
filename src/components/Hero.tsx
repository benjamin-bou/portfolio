import { useEffect, useRef } from 'react';
import StarfieldCanvas from './StarfieldCanvas';

const WORDS = [
  { text: "J'aime", em: false },
  { text: 'apprendre', em: true },
  { text: 'et', em: false },
  { text: 'découvrir', em: false },
  { text: 'en', em: false },
  { text: 'construisant', em: true },
  { text: 'mes', em: false },
  { text: 'propres', em: false },
  { text: 'outils.', em: false },
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

  return (
    <section
      id="hero"
      className="hero relative overflow-hidden flex items-center max-md:items-start"
      style={{
        minHeight: '100svh',
        padding:
          'clamp(110px, 16vh, 150px) clamp(24px, 5vw, 80px) clamp(160px, 22vh, 240px)',
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
            <span key={i}>
              <span className={`word w${i + 1}`}>
                {w.em ? <em>{w.text}</em> : w.text}
              </span>
              {i < WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <div className="fade-up-delayed mt-15">
          <p className="max-w-[46ch] text-sm leading-[1.7] text-cream/80">
            Étudiant à Epitech, alternant chez{' '}
            <strong className="text-orange-hot font-medium">Spayr</strong>. J'aime
            construire des <em className="italic">produits complets</em>, de l'idée à la
            mise en ligne. Je m'intéresse et m'adapte aux nouvelles technologies qui
            dessinent le développement de demain.
          </p>
        </div>
      </div>

      <div
        className="fade-up-stats absolute z-[2] flex gap-10 flex-wrap"
        style={{
          left: 'clamp(24px, 5vw, 80px)',
          right: 'clamp(24px, 5vw, 80px)',
          bottom: 'clamp(24px, 4vh, 56px)',
        }}
      >
        <Stat n="5" count setRef={(el) => (counterRefs.current[0] = el)} label="années d'études" />
        <Stat n="2" count setRef={(el) => (counterRefs.current[1] = el)} label="années d'expérience" />
        <Stat n="3" count setRef={(el) => (counterRefs.current[2] = el)} label="projets livrés" />
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
