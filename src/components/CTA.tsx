export default function CTA() {
  return (
    <section
      id="contact"
      className="cta-bg relative overflow-hidden"
      style={{ padding: 'clamp(80px, 16vh, 180px) clamp(24px, 5vw, 80px) clamp(60px, 10vh, 120px)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="reveal font-mono text-[11px] uppercase tracking-[0.32em] text-muted mb-8">
          — Fin de la trace
        </div>

        <h3
          className="cta-name font-serif font-normal text-white mb-4"
          style={{ fontSize: 'clamp(56px, 9vw, 140px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
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
        </h3>

        <div className="reveal delay-2 grid sm:grid-cols-2 gap-x-10 gap-y-4 mb-16 max-w-2xl">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted mb-1.5">
              École
            </div>
            <div className="font-serif text-lg text-white leading-snug">Master of science · Epitech</div>
            <div className="font-mono text-xs text-cream/55 mt-0.5">Rennes</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted mb-1.5">
              Alternance
            </div>
            <div className="font-serif text-lg text-white leading-snug">Full-stack · Spayr</div>
            <div className="font-mono text-xs text-cream/55 mt-0.5">Paris</div>
          </div>
        </div>

        <div className="reveal delay-3 grid sm:grid-cols-2 gap-3">
          <a
            href="https://github.com/benjamin-bou"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between px-5 py-5 border border-cream/15 hover:border-cream/40 transition-colors"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-cream/80 group-hover:text-white transition-colors">
              GitHub
            </span>
            <span className="font-serif text-cream/60 group-hover:text-white transition-colors">↗</span>
          </a>
          <a
            href="https://www.linkedin.com/in/benjamin-boutrois-2640462b0/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between px-5 py-5 border border-cream/15 hover:border-cream/40 transition-colors"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-cream/80 group-hover:text-white transition-colors">
              LinkedIn
            </span>
            <span className="font-serif text-cream/60 group-hover:text-white transition-colors">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
