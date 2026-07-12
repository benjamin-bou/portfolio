import { TOK, FONT, TYPE, TEXTURES, LAYOUT } from './tokens';
import { Kicker, Dot } from './primitives';

const TECH = [
  { label: 'Frontend', items: ['React · TypeScript', 'CSS · Tailwind', 'Responsive design', 'Accessibilité'] },
  { label: 'Backend', items: ['PHP · Laravel', 'Ruby · Rails', 'API REST', 'PostgreSQL · MySQL'] },
  { label: 'DevOps', items: ['Docker · CI/CD', 'VPS', 'Monitoring', 'Tests automatisés'] },
  { label: 'Outils', items: ['Git & review', 'Figma & design', 'Claude Code', 'Notion · Jira'] },
];

export default function LithoMetier() {
  return (
    <section
      className="litho-section"
      style={{
        position: 'relative',
        background: TOK.bgDeep,
        color: TOK.cream,
        padding: LAYOUT.sectionPad,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: LAYOUT.maxW, margin: '0 auto' }}>
        <div
          className="litho-metier-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
            gap: 'clamp(40px, 6vw, 96px)',
            alignItems: 'start',
          }}
        >
          {/* LEFT — sticky title (statique en mobile : voir style plus bas) */}
          <div className="litho-metier-title" style={{ position: 'sticky', top: 120 }}>
            <Kicker style={{ marginBottom: 30 }}>Chapitre II · Le métier</Kicker>

            <h2 style={{ ...TYPE.h2, margin: '0 0 28px', maxWidth: '10ch' }}>
              Mon métier
              <Dot />
            </h2>

            <p
              style={{
                fontFamily: FONT.serif,
                fontStyle: 'italic',
                fontSize: 'clamp(17px, 1.4vw, 22px)',
                lineHeight: 1.45,
                color: TOK.creamSoft,
                margin: 0,
                maxWidth: '28ch',
              }}
            >
              Développeur full-stack. React, Laravel, DevOps.
            </p>
          </div>

          {/* RIGHT — fiche technique en rangées */}
          <div style={{ borderTop: `1px solid ${TOK.line}` }}>
            {TECH.map((col, i) => (
              <div
                key={col.label}
                className="litho-metier-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px minmax(0, 1fr) minmax(0, 1.5fr)',
                  gap: 'clamp(16px, 2.5vw, 44px)',
                  alignItems: 'start',
                  padding: '28px 0',
                  borderBottom: `1px solid ${TOK.line}`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    color: TOK.sun,
                    paddingTop: 5,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  style={{
                    fontFamily: FONT.display,
                    fontWeight: 800,
                    fontSize: 'clamp(20px, 2vw, 28px)',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    color: TOK.cream,
                    margin: 0,
                  }}
                >
                  {col.label}
                </h3>
                <ul
                  className="litho-metier-items"
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 7,
                  }}
                >
                  {col.items.map((item) => (
                    <li
                      key={item}
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 17,
                        lineHeight: 1.45,
                        color: TOK.creamSoft,
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
          /* En colonne unique, un titre « sticky » resterait collé pendant que
             les lignes techniques défilent par-dessus → chevauchement. Statique. */
          .litho-metier-title { position: static !important; }
        }
        @media (max-width: 700px) {
          .litho-metier-row { grid-template-columns: 44px minmax(0, 1fr) !important; }
          .litho-metier-items { grid-column: 2; }
        }
      `}</style>
    </section>
  );
}
