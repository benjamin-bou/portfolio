import { TOK, FONT, TEXTURES } from './tokens';

export default function LithoCTA() {
  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        background: TOK.dark,
        color: TOK.cream,
        padding: 'clamp(100px, 18vh, 200px) clamp(24px, 5vw, 80px) clamp(80px, 12vh, 140px)',
        overflow: 'hidden',
      }}
    >
      {/* Grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          mixBlendMode: 'soft-light',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-right sun disk — closing flourish */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -200,
          right: -120,
          width: 'clamp(280px, 32vw, 520px)',
          height: 'clamp(280px, 32vw, 520px)',
          borderRadius: '50%',
          background: TOK.sun,
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -260,
          right: -180,
          width: 'clamp(360px, 40vw, 640px)',
          height: 'clamp(360px, 40vw, 640px)',
          borderRadius: '50%',
          border: `1px solid ${TOK.sun}33`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: TOK.sun,
            marginBottom: 36,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{ width: 28, height: 1, background: TOK.sun }} />
          Fin de la trace
        </div>

        <h2
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 'clamp(56px, 9vw, 140px)',
            lineHeight: 0.88,
            letterSpacing: '-0.03em',
            color: TOK.cream,
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          Benjamin
          <br />
          <span style={{ color: TOK.sun }}>Boutrois.</span>
        </h2>

        {/* École / Alternance grid */}
        <div
          className="litho-cta-grid"
          style={{
            marginTop: 64,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(24px, 4vw, 60px)',
            maxWidth: 720,
          }}
        >
          <Block
            kicker="École"
            title="Master of science · Epitech"
            sub="Rennes"
          />
          <Block
            kicker="Alternance"
            title="Full-stack · Spayr"
            sub="Paris"
          />
        </div>

        {/* Buttons */}
        <div
          className="litho-cta-buttons"
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
            maxWidth: 720,
          }}
        >
          <LithoButton href="https://github.com/benjamin-bou" label="GitHub" />
          <LithoButton href="https://www.linkedin.com/in/benjamin-boutrois-2640462b0/" label="LinkedIn" />
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .litho-cta-grid { grid-template-columns: 1fr !important; }
          .litho-cta-buttons { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Block({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: TOK.mutedCream,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: FONT.serif,
          fontSize: 22,
          color: TOK.cream,
          lineHeight: 1.25,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: TOK.mutedCream,
          marginTop: 4,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function LithoButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 24px',
        border: `1px solid rgba(248,241,225,0.18)`,
        textDecoration: 'none',
        color: TOK.cream,
        fontFamily: FONT.mono,
        fontSize: 12,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = TOK.sun;
        e.currentTarget.style.color = TOK.cream;
        const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
        if (arrow) arrow.style.color = TOK.sun;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(248,241,225,0.18)';
        const arrow = e.currentTarget.querySelector('.arrow') as HTMLElement;
        if (arrow) arrow.style.color = TOK.cream;
      }}
    >
      <span>{label}</span>
      <span
        className="arrow"
        style={{
          fontFamily: FONT.serif,
          fontStyle: 'italic',
          fontSize: 18,
          color: TOK.cream,
          transition: 'color 0.2s',
        }}
      >
        ↗
      </span>
    </a>
  );
}
