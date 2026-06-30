import StarfieldCanvas from './StarfieldCanvas';

export default function Hero() {
  return (
    <section
      id="hero"
      className="hero relative overflow-hidden flex flex-col justify-end"
      style={{
        minHeight: '100svh',
        padding: 'clamp(110px, 16vh, 150px) clamp(24px, 5vw, 80px) clamp(60px, 10vh, 120px)',
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

      <div className="relative z-[2] max-w-[1400px] mx-auto w-full">
        <div className="fade-up-eyebrow font-mono text-[11px] uppercase tracking-[0.35em] text-orange-hot mb-6">
          Portfolio · 2026
        </div>

        <h1
          className="font-serif font-normal text-white"
          style={{ fontSize: 'clamp(72px, 12vw, 200px)', lineHeight: 0.9, letterSpacing: '-0.04em' }}
        >
          Benjamin{' '}
          <em
            className="italic"
            style={{
              background: 'linear-gradient(180deg, var(--orange-glow), var(--orange))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Boutrois
          </em>
        </h1>

        <div className="fade-up-delayed mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.28em] text-cream/70">
          <span>Développeur full-stack</span>
          <span className="text-cream/30">·</span>
          <span>Epitech Rennes</span>
          <span className="text-cream/30">·</span>
          <span>Spayr · Paris</span>
        </div>
      </div>
    </section>
  );
}
