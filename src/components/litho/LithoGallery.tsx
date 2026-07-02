import { TOK, FONT, TEXTURES } from './tokens';

const PROJECTS = [
  {
    idx: '01',
    org: 'Alternance · Spayr',
    title: 'Développement produit',
    sub: 'en startup',
    meta: 'En cours · 2025',
    tags: ['React', 'TypeScript', 'Node'],
    bg: TOK.sun,
    ink: TOK.cream,
    ongoing: true,
  },
  {
    idx: '02',
    org: 'Alternance · Cap Achat',
    title: 'Refonte d’un outil',
    sub: 'métier',
    meta: '2024 — 2025',
    tags: ['React', 'API REST', 'UX'],
    bg: TOK.cool, // slate — breaks the warm monochrome
    ink: TOK.cream,
  },
  {
    idx: '03',
    org: 'Projet école',
    title: 'Une application',
    sub: 'full-stack',
    meta: 'Epitech · 2025',
    tags: ['Next.js', 'Postgres', 'Auth'],
    bg: TOK.peach,
    ink: TOK.dark,
  },
  {
    idx: '04',
    org: 'Projet perso',
    title: 'Ce portfolio,',
    sub: 'fait main',
    meta: '2026 · ici même',
    tags: ['React', 'Three.js', 'GSAP'],
    bg: TOK.dark,
    ink: TOK.cream,
  },
];

export default function LithoGallery() {
  return (
    <section
      id="work"
      style={{
        position: 'relative',
        background: TOK.dark,
        color: TOK.cream,
        padding: 'clamp(80px, 14vh, 160px) 0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          mixBlendMode: 'multiply',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 clamp(24px, 5vw, 80px)',
            marginBottom: 56,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: TOK.sun,
                marginBottom: 18,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span style={{ width: 28, height: 1, background: TOK.sun }} />
              Chapitre III · Quelques projets
            </div>
            <h2
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 'clamp(40px, 5.4vw, 84px)',
                lineHeight: 0.92,
                letterSpacing: '-0.025em',
                color: TOK.cream,
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              Quatre <span style={{ color: TOK.sun }}>épreuves.</span>
            </h2>
          </div>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: TOK.mutedCream,
            }}
          >
            Alternance · École · Personnel — faire défiler →
          </div>
        </div>

        {/* Track */}
        <div
          style={{
            display: 'flex',
            gap: 26,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            padding: '0 clamp(24px, 5vw, 80px) 22px',
          }}
        >
          {PROJECTS.map((p) => (
            <article
              key={p.idx}
              style={{
                position: 'relative',
                flex: '0 0 clamp(280px, 32vw, 440px)',
                aspectRatio: '3 / 4',
                background: p.bg,
                color: p.ink,
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                boxShadow: '0 16px 40px rgba(26,18,9,0.25)',
              }}
            >
              {/* Affiche frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: 14,
                  border: `1px solid ${p.ink === TOK.cream ? 'rgba(248,241,225,0.22)' : 'rgba(26,18,9,0.22)'}`,
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
                  color: p.ink,
                  opacity: 0.08,
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
                    color: p.ink,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: p.ink,
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
                    color: p.ink,
                    opacity: 0.78,
                  }}
                >
                  {p.idx} · {p.org}
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: FONT.display,
                      fontWeight: 800,
                      fontSize: 'clamp(28px, 2.6vw, 40px)',
                      lineHeight: 0.92,
                      letterSpacing: '-0.02em',
                      color: p.ink,
                      margin: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.title}
                    <br />
                    <span style={{ fontStyle: 'italic', fontFamily: FONT.serif, fontWeight: 400, textTransform: 'none', color: p.ink }}>
                      {p.sub}.
                    </span>
                  </h3>
                  <div
                    style={{
                      marginTop: 14,
                      fontFamily: FONT.mono,
                      fontSize: 10,
                      letterSpacing: '0.26em',
                      textTransform: 'uppercase',
                      color: p.ink,
                      opacity: 0.78,
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
                          fontSize: 9,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          padding: '4px 9px',
                          border: `1px solid ${p.ink === TOK.cream ? 'rgba(248,241,225,0.35)' : 'rgba(26,18,9,0.35)'}`,
                          color: p.ink,
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
        @keyframes litho-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
