import { TOK, FONT, TEXTURES, LAYOUT } from './tokens';
import { Kicker, Dot, InfoBlock } from './primitives';

export default function LithoCTA() {
  return (
    <section
      id="contact"
      style={{
        position: 'relative',
        background: TOK.bgDeep,
        color: TOK.cream,
        padding: `clamp(100px, 18vh, 200px) ${LAYOUT.padX} clamp(80px, 12vh, 140px)`,
        overflow: 'hidden',
      }}
    >
      {/* Grain — sans blend (perf) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />
      {/* Marque solaire de clôture — écho du hero */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -220,
          right: -140,
          width: 'clamp(360px, 40vw, 640px)',
          height: 'clamp(360px, 40vw, 640px)',
          borderRadius: '50%',
          border: `1px solid ${TOK.line}`,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '20%',
            width: '56%',
            height: '56%',
            borderRadius: '50%',
            background: TOK.sun,
            opacity: 0.16,
          }}
        />
      </div>

      <div style={{ position: 'relative', maxWidth: LAYOUT.maxW, margin: '0 auto' }}>
        <Kicker style={{ marginBottom: 36 }}>Contact</Kicker>

        <h2
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 'clamp(56px, 8vw, 120px)',
            lineHeight: 0.88,
            letterSpacing: '-0.03em',
            color: TOK.cream,
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          Discutons
          <Dot />
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
          <InfoBlock label="École" title="Master of Science · Epitech" sub="Rennes" />
          <InfoBlock label="Alternance" title="Full-stack · Spayr" sub="Paris" />
        </div>

        {/* Buttons */}
        <div
          className="litho-cta-buttons"
          style={{
            marginTop: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            maxWidth: 900,
          }}
        >
          <LithoButton href="mailto:benjaminboutrois04@gmail.com" label="Email" arrow="→" />
          <LithoButton href="https://github.com/benjamin-bou" label="GitHub" arrow="↗" external />
          <LithoButton
            href="https://www.linkedin.com/in/benjamin-boutrois-2640462b0/"
            label="LinkedIn"
            arrow="↗"
            external
          />
        </div>
      </div>

      <style>{`
        .litho-cta-btn {
          border: 1px solid ${TOK.line};
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .litho-cta-btn:hover {
          border-color: ${TOK.sun};
          background: ${TOK.sunSoft};
        }
        .litho-cta-btn:hover .litho-cta-arrow {
          color: ${TOK.sun};
        }
        @media (max-width: 700px) {
          .litho-cta-grid { grid-template-columns: 1fr !important; }
          .litho-cta-buttons { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function LithoButton({
  href,
  label,
  arrow,
  external,
}: {
  href: string;
  label: string;
  arrow: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className="litho-cta-btn"
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 24px',
        textDecoration: 'none',
        color: TOK.cream,
        fontFamily: FONT.mono,
        fontSize: 12,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
      }}
    >
      <span>{label}</span>
      <span
        className="litho-cta-arrow"
        style={{
          fontFamily: FONT.serif,
          fontStyle: 'italic',
          fontSize: 18,
          color: TOK.creamMuted,
          transition: 'color 0.2s ease',
        }}
      >
        {arrow}
      </span>
    </a>
  );
}
