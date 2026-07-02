import { TOK, FONT, TEXTURES } from './tokens';

const ABOUT_PHOTO = '/images/about.jpg';

export default function LithoAbout() {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        background: TOK.dark,
        color: TOK.cream,
        padding: 'clamp(80px, 14vh, 160px) clamp(24px, 5vw, 80px)',
        overflow: 'hidden',
      }}
    >
      {/* Grain texture for litho feel */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      {/* Soft warm gradient hint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226,122,46,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
        {/* Kicker */}
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
          Chapitre I · Présentation
        </div>

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
            <h2
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 'clamp(48px, 7vw, 112px)',
                lineHeight: 0.92,
                letterSpacing: '-0.025em',
                color: TOK.cream,
                margin: '0 0 40px',
                textTransform: 'uppercase',
                maxWidth: '14ch',
              }}
            >
              Développeur,
              <br />
              <span style={{ color: TOK.sun }}>coureur,</span>
              <br />
              <span style={{ color: TOK.sun }}>randonneur.</span>
            </h2>

            <div
              style={{
                fontFamily: FONT.serif,
                fontSize: 'clamp(18px, 1.5vw, 22px)',
                lineHeight: 1.55,
                color: 'rgba(240,231,212,0.82)',
                maxWidth: '54ch',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <p style={{ margin: 0 }}>
                Je m'appelle <em style={{ fontStyle: 'italic', color: TOK.sun }}>Benjamin</em>, j'ai 23 ans. Je
                suis en alternance depuis <em style={{ fontStyle: 'italic', color: TOK.sun }}>septembre 2024</em>
                , à <em style={{ fontStyle: 'italic', color: TOK.sun }}>Epitech Rennes</em> côté école et chez{' '}
                <em style={{ fontStyle: 'italic', color: TOK.sun }}>Spayr</em> à Paris depuis septembre 2025.
              </p>
              <p style={{ margin: 0 }}>
                J'aime essayer des trucs — un nouvel outil, un side-project le week-end, un format que je n'ai
                jamais touché. Bricoler avec des nouveaux outils, tester des nouveaux projets avec l'IA.
              </p>
              <p style={{ margin: 0 }}>
                À côté je cours environ 4 sorties par semaine. J'ai déjà fini plusieurs semi-marathons et je
                prépare mon premier marathon pour l'été 2026.
              </p>
              <p style={{ margin: 0 }}>
                J'aime aussi voyager et changer de décor dès que je peux — un week-end à l'autre bout de la
                France, un voyage improvisé avec mes amis. C'est dans ces moments-là que je recharge vraiment.
              </p>
            </div>
          </div>

          {/* RIGHT — photo + notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, position: 'sticky', top: 120 }}>
            <figure
              style={{
                position: 'relative',
                margin: 0,
                overflow: 'hidden',
                aspectRatio: '4 / 5',
                border: `1px solid ${TOK.ink}40`,
                boxShadow: '0 28px 60px rgba(26,18,9,0.45), 0 0 30px rgba(226,122,46,0.08)',
              }}
            >
              <img
                src={ABOUT_PHOTO}
                alt="Sentier de montagne au coucher du soleil"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  filter: 'saturate(1.05) contrast(1.05)',
                }}
              />
              {/* Peach multiply — unifies with section palette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(180deg, ${TOK.peach}aa 0%, transparent 30%, rgba(26,18,9,0.7) 100%)`,
                  mixBlendMode: 'multiply',
                  pointerEvents: 'none',
                }}
              />
              <figcaption
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
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
                    color: TOK.peach,
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
                  Alternant <em style={{ fontStyle: 'italic', color: TOK.sun }}>développeur full-stack</em> chez
                  Spayr, à Paris.
                </>,
                <>
                  En <em style={{ fontStyle: 'italic', color: TOK.sun }}>Master of Science</em> à Epitech Rennes,
                  parcours administrateur SI.
                </>,
                <>
                  Curieux des outils et de l'<em style={{ fontStyle: 'italic', color: TOK.sun }}>IA appliquée</em>{' '}
                  au produit.
                </>,
                <>
                  Hors écran : <em style={{ fontStyle: 'italic', color: TOK.sun }}>course à pied</em> et{' '}
                  <em style={{ fontStyle: 'italic', color: TOK.sun }}>randonnée</em> longue distance.
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
                    color: TOK.cream,
                    paddingTop: i === 0 ? 0 : 16,
                    paddingBottom: i === arr.length - 1 ? 0 : 16,
                    borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${TOK.cream}1f`,
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
