import { TOK, FONT, TEXTURES } from './tokens';

const TECH = [
  { label: 'Frontend', items: ['React · TypeScript', 'CSS · Tailwind', 'Responsive design', 'Accessibilité'] },
  { label: 'Backend', items: ['PHP · Laravel', 'Ruby · Rails', 'API REST', 'PostgreSQL · MySQL'] },
  { label: 'DevOps', items: ['Docker · CI/CD', 'VPS', 'Monitoring', 'Tests automatisés'] },
  { label: 'Outils', items: ['Git & review', 'Figma & design', 'Claude Code', 'Notion · Jira'] },
];

export default function LithoMetier() {
  return (
    <section
      style={{
        position: 'relative',
        background: TOK.dark,
        color: TOK.cream,
        padding: 'clamp(80px, 14vh, 160px) clamp(24px, 5vw, 80px)',
        overflow: 'hidden',
      }}
    >
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
      {/* Subtle vermillon glow top-right for depth */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226,122,46,0.18) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
        <div
          className="litho-metier-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
            gap: 'clamp(40px, 6vw, 96px)',
            alignItems: 'start',
          }}
        >
          {/* LEFT — sticky title */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: TOK.sun,
                marginBottom: 30,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span style={{ width: 28, height: 1, background: TOK.sun }} />
              Chapitre II · Le métier
            </div>

            <h2
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 'clamp(48px, 6vw, 96px)',
                lineHeight: 0.92,
                letterSpacing: '-0.025em',
                color: TOK.cream,
                margin: '0 0 28px',
                textTransform: 'uppercase',
                maxWidth: '10ch',
              }}
            >
              Mon <span style={{ color: TOK.sun }}>métier.</span>
            </h2>

            <p
              style={{
                fontFamily: FONT.serif,
                fontStyle: 'italic',
                fontSize: 'clamp(17px, 1.4vw, 22px)',
                lineHeight: 1.45,
                color: TOK.cream,
                opacity: 0.78,
                margin: 0,
                maxWidth: '28ch',
              }}
            >
              Développeur full-stack. React, Laravel, DevOps — et tout ce qu'il faut entre.
            </p>
          </div>

          {/* RIGHT — tech cards grid */}
          <div
            className="litho-metier-cards"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 18,
            }}
          >
            {TECH.map((col) => (
              <div
                key={col.label}
                style={{
                  position: 'relative',
                  background: TOK.panel,
                  border: `1px solid rgba(248, 241, 225, 0.1)`,
                  padding: 26,
                  overflow: 'hidden',
                }}
              >
                {/* Corner tick */}
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 18,
                    height: 18,
                    borderTop: `2px solid ${TOK.sun}`,
                    borderRight: `2px solid ${TOK.sun}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: FONT.serif,
                    fontStyle: 'italic',
                    fontSize: 22,
                    color: TOK.sun,
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ width: 18, height: 2, background: TOK.sun }} />
                  {col.label}
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 16,
                        color: TOK.cream,
                        opacity: 0.86,
                        lineHeight: 1.4,
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .litho-metier-grid { grid-template-columns: 1fr !important; }
          .litho-metier-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
