import { TOK, FONT, TYPE, TEXTURES, LAYOUT } from './tokens';
import { Kicker, Dot } from './primitives';

const ABOUT_PHOTO = '/images/about.jpg';

export default function LithoAbout() {
  return (
    <section
      id="about"
      className="litho-section"
      style={{
        position: 'relative',
        background: TOK.bg,
        color: TOK.cream,
        padding: LAYOUT.sectionPad,
        overflow: 'hidden',
      }}
    >
      {/* Grain texture for litho feel — sans blend (perf) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: LAYOUT.maxW, margin: '0 auto' }}>
        <Kicker style={{ marginBottom: 36 }}>Chapitre I · Présentation</Kicker>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
            gap: 'clamp(40px, 6vw, 96px)',
            alignItems: 'start',
          }}
          className="litho-about-grid"
        >
          {/* LEFT — heading + body */}
          <div>
            <h2 style={{ ...TYPE.h2, margin: '0 0 40px', maxWidth: '14ch' }}>
              Développeur,
              <br />
              coureur,
              <br />
              randonneur
              <Dot />
            </h2>

            <div
              style={{
                ...TYPE.body,
                maxWidth: '54ch',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <p style={{ margin: 0 }}>
                Je m'appelle <em>Benjamin</em>, j'ai 23 ans. Je suis en alternance depuis{' '}
                <em>septembre 2024</em>, à <em>Epitech Rennes</em> côté école et chez <em>Spayr</em> à Paris
                depuis septembre 2025.
              </p>
              <p style={{ margin: 0 }}>
                J'aime essayer de nouvelles choses, un nouvel outil, un side-project, un nouveau langage.
                Bricoler avec des nouveaux outils, tester des nouveaux projets avec l'IA.
              </p>
              <p style={{ margin: 0 }}>
                J'aime beaucoup la course à pied ! Je cours plusieurs fois par semaine et j'ai déjà fini
                plusieurs semi-marathons.
              </p>
              <p style={{ margin: 0 }}>
                J'aime aussi changer de décor, une randonnée en Bretagne, ou un voyage improvisé avec mes
                amis. C'est dans ces moments-là que je recharge vraiment.
              </p>
            </div>
          </div>

          {/* RIGHT — photo + notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, position: 'sticky', top: 120 }}>
            <figure
              style={{
                position: 'relative',
                margin: 0,
                padding: 10,
                background: TOK.cream,
                transform: 'rotate(-0.8deg)',
                boxShadow: '0 24px 60px rgba(20, 16, 10, 0.5)',
              }}
            >
              <img
                src={ABOUT_PHOTO}
                alt="Benjamin en randonnée à Quiberon"
                style={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  display: 'block',
                  objectFit: 'cover',
                }}
              />
              {/* Dégradé bas — lisibilité de la légende, sans teinter la photo */}
              <div
                style={{
                  position: 'absolute',
                  inset: 10,
                  background: 'linear-gradient(180deg, transparent 55%, rgba(24, 19, 13, 0.72) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <figcaption
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  right: 10,
                  padding: 22,
                  color: TOK.cream,
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    letterSpacing: '0.32em',
                    textTransform: 'uppercase',
                    color: TOK.sun,
                    marginBottom: 6,
                  }}
                >
                  Mai 2026
                </div>
                <div
                  style={{
                    fontFamily: FONT.serif,
                    fontStyle: 'italic',
                    fontSize: 19,
                    lineHeight: 1.2,
                  }}
                >
                  Quiberon — Bretagne.
                </div>
              </figcaption>
            </figure>

            {/* Numbered notes */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                <>
                  Alternant <em>développeur full-stack</em> chez Spayr, à Paris.
                </>,
                <>
                  En <em>Master of Science</em> à Epitech Rennes, parcours administrateur SI.
                </>,
                <>
                  Curieux des outils et de l'<em>IA appliquée</em> au produit.
                </>,
                <>
                  Hors écran : <em>course à pied</em> et <em>randonnée</em>.
                </>,
              ].map((item, i, arr) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 18,
                    alignItems: 'baseline',
                    fontFamily: FONT.serif,
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: TOK.creamSoft,
                    paddingTop: i === 0 ? 0 : 16,
                    paddingBottom: i === arr.length - 1 ? 0 : 16,
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${TOK.lineSoft}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      color: TOK.sun,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .litho-about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
