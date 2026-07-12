import { TOK, FONT, TYPE, TEXTURES, LAYOUT } from './tokens';
import { Kicker, Dot } from './primitives';

type Project = {
  idx: string;
  org: string;
  title: string;
  sub: string;
  meta: string;
  tags: string[];
  ongoing?: boolean;
};

const PROJECTS: Project[] = [
  {
    idx: '01',
    org: 'Alternance · Spayr',
    title: 'Développement produit',
    sub: 'en startup',
    meta: 'En cours · 2025',
    tags: ['React', 'TypeScript', 'Node'],
    ongoing: true,
  },
  {
    idx: '02',
    org: 'Alternance · Cap Achat',
    title: 'Refonte d’un outil',
    sub: 'métier',
    meta: '2024 — 2025',
    tags: ['React', 'API REST', 'UX'],
  },
  {
    idx: '03',
    org: 'Projet école',
    title: 'Une application',
    sub: 'full-stack',
    meta: 'Epitech · 2025',
    tags: ['Next.js', 'Postgres', 'Auth'],
  },
  {
    idx: '04',
    org: 'Projet perso',
    title: 'Ce portfolio',
    sub: '',
    meta: '2026 · ici même',
    tags: ['React', 'TypeScript', 'SVG'],
  },
];

export default function LithoGallery() {
  return (
    <section
      id="work"
      style={{
        position: 'relative',
        background: TOK.bg,
        color: TOK.cream,
        padding: 'clamp(90px, 14vh, 170px) 0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* En-tête : même alignement que les autres sections — conteneur maxW
            centré à l'intérieur du gutter, pour que le titre partage le bord
            gauche de « Présentation », « Le métier », etc. */}
        <div style={{ padding: `0 ${LAYOUT.padX}` }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 16,
              maxWidth: LAYOUT.maxW,
              margin: '0 auto',
              marginBottom: 56,
            }}
          >
            <div>
              <Kicker style={{ marginBottom: 18 }}>Chapitre III · Quelques projets</Kicker>
              <h2 style={TYPE.h2}>
                Quelques projets
                <Dot />
              </h2>
            </div>
            <div style={{ ...TYPE.meta, color: TOK.creamFaint }}>faire défiler →</div>
          </div>
        </div>

        {/* Track — la première carte s'aligne sur le bord gauche du titre
            (conteneur maxW centré) tout en débordant à droite pour le scroll */}
        <div
          style={{
            display: 'flex',
            gap: 26,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            // scroll-padding aligné sur le padding : sinon le snap « start »
            // colle la 1re carte au bord et annule l'alignement sous le titre.
            scrollPaddingLeft: `max(${LAYOUT.padX}, calc((100vw - ${LAYOUT.maxW}px) / 2))`,
            paddingLeft: `max(${LAYOUT.padX}, calc((100vw - ${LAYOUT.maxW}px) / 2))`,
            paddingRight: LAYOUT.padX,
            paddingBottom: 22,
          }}
        >
          {PROJECTS.map((p) => (
            <article
              key={p.idx}
              className="litho-card"
              style={{
                position: 'relative',
                flex: '0 0 clamp(280px, 32vw, 420px)',
                aspectRatio: '3 / 4',
                background: TOK.panel,
                color: TOK.cream,
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                boxShadow: '0 18px 44px rgba(20, 16, 10, 0.35)',
              }}
            >
              {/* Affiche frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: 14,
                  border: `1px solid ${TOK.lineSoft}`,
                  pointerEvents: 'none',
                }}
              />

              {/* Big watermark numeral */}
              <div
                style={{
                  position: 'absolute',
                  top: -20,
                  right: -10,
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 'clamp(160px, 20vw, 280px)',
                  lineHeight: 0.85,
                  color: TOK.sun,
                  opacity: 0.13,
                  letterSpacing: '-0.05em',
                  pointerEvents: 'none',
                }}
              >
                {p.idx}
              </div>

              {/* Ongoing pulse */}
              {p.ongoing && (
                <div
                  style={{
                    position: 'absolute',
                    top: 26,
                    right: 30,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: TOK.sun,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: TOK.sun,
                      animation: 'litho-pulse 1.4s ease-in-out infinite',
                    }}
                  />
                  En cours
                </div>
              )}

              {/* Content */}
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '32px 30px',
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: TOK.creamMuted,
                  }}
                >
                  {p.idx} · {p.org}
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: FONT.display,
                      fontWeight: 800,
                      fontSize: 'clamp(28px, 2.6vw, 38px)',
                      lineHeight: 0.94,
                      letterSpacing: '-0.02em',
                      color: TOK.cream,
                      margin: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.title}
                    {p.sub ? (
                      <>
                        <br />
                        <span
                          style={{
                            fontStyle: 'italic',
                            fontFamily: FONT.serif,
                            fontWeight: 400,
                            textTransform: 'none',
                            color: TOK.creamSoft,
                          }}
                        >
                          {p.sub}.
                        </span>
                      </>
                    ) : (
                      '.'
                    )}
                  </h3>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: FONT.mono,
                      fontSize: 10,
                      letterSpacing: '0.26em',
                      textTransform: 'uppercase',
                      color: TOK.creamMuted,
                    }}
                  >
                    {p.meta}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: 10,
                          letterSpacing: '0.12em',
                          textTransform: 'lowercase',
                          padding: '4px 9px',
                          border: `1px solid ${TOK.line}`,
                          color: TOK.creamSoft,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .litho-card {
          border: 1px solid ${TOK.line};
          transition: border-color 0.25s ease, transform 0.35s ease;
        }
        /* Affiches punaisées — légèrement de travers, se redressent au survol */
        .litho-card:nth-child(odd) { transform: rotate(-0.5deg); }
        .litho-card:nth-child(even) { transform: rotate(0.45deg); }
        .litho-card:hover {
          border-color: ${TOK.sun};
          transform: rotate(0deg) translateY(-6px);
        }
        @keyframes litho-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
