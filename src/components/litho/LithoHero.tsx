import { TOK, FONT, TEXTURES, LAYOUT } from './tokens';
import { Dot } from './primitives';

/**
 * Hero — affiche typographique pure, sans photo.
 * L'identité litho porte seule : fond sombre chaud dégradé, grain halftone,
 * marque solaire (anneau + disque, reprise en clôture du CTA), titre géant.
 */
export default function LithoHero() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        overflow: 'hidden',
        color: TOK.cream,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: `clamp(110px, 16vh, 150px) ${LAYOUT.padX} clamp(44px, 7vh, 90px)`,
        background: `linear-gradient(180deg, ${TOK.bg} 0%, ${TOK.bg} 55%, ${TOK.bgDeep} 100%)`,
      }}
    >
      {/* Halo chaud très doux derrière la marque solaire */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-12%',
          width: 'clamp(480px, 55vw, 900px)',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226, 122, 46, 0.16) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />
      {/* Marque solaire — anneau fin + disque, motif repris en clôture (CTA) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'clamp(96px, 15vh, 180px)',
          right: 'clamp(24px, 6vw, 96px)',
          width: 'clamp(190px, 24vw, 340px)',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          border: '1px solid rgba(240, 231, 212, 0.35)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '23%',
            width: '54%',
            height: '54%',
            borderRadius: '50%',
            background: TOK.sun,
            opacity: 0.94,
          }}
        />
      </div>
      {/* Grain — sans mix-blend-mode (perf : calque cacheable, pas de re-blend au scroll) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: LAYOUT.maxW, margin: '0 auto', width: '100%' }}>
        <h1
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 'clamp(60px, 10vw, 176px)',
            lineHeight: 0.87,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: TOK.cream,
            margin: 0,
          }}
        >
          Benjamin
          <span style={{ display: 'block', marginLeft: '0.55em' }}>
            Boutrois
            <Dot />
          </span>
        </h1>

        <div
          style={{
            marginTop: 40,
            paddingTop: 24,
            borderTop: `1px solid ${TOK.line}`,
            fontFamily: FONT.serif,
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 1.6vw, 23px)',
            lineHeight: 1.5,
            color: TOK.cream,
            opacity: 0.92,
            maxWidth: '52ch',
          }}
        >
          Développeur full-stack — en master à Epitech Rennes, en alternance chez Spayr à Paris.
        </div>
      </div>
    </section>
  );
}
