import { TOK, FONT, TEXTURES } from './tokens';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85';

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
        padding: 'clamp(110px, 16vh, 150px) clamp(24px, 5vw, 80px) clamp(50px, 8vh, 100px)',
        background: TOK.dark,
      }}
    >
      {/* Photo background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${HERO_PHOTO})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          opacity: 0.9,
        }}
      />
      {/* Peach multiply for palette unity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${TOK.peach} 0%, ${TOK.peach}cc 40%, #3e3530cc 100%)`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      {/* Warm screen highlight pull */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(232,220,196,0.18) 0%, transparent 60%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      {/* Sun disk — graphic flourish, top-right */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'clamp(80px, 14vh, 180px)',
          right: 'clamp(-80px, -6vw, -40px)',
          width: 'clamp(280px, 36vw, 540px)',
          height: 'clamp(280px, 36vw, 540px)',
          borderRadius: '50%',
          background: TOK.sun,
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      />
      {/* Grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: TEXTURES.grain,
          mixBlendMode: 'multiply',
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />
      {/* Bottom vignette for legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(26,18,9,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* CONTENT */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <h1
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 'clamp(64px, 11vw, 200px)',
            lineHeight: 0.86,
            letterSpacing: '-0.035em',
            textTransform: 'uppercase',
            color: TOK.cream,
            margin: 0,
            textShadow: '0 4px 32px rgba(26,18,9,0.4)',
          }}
        >
          Benjamin
          <br />
          <span style={{ color: TOK.sun }}>Boutrois.</span>
        </h1>

        <div
          style={{
            marginTop: 28,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px 22px',
            fontFamily: FONT.mono,
            fontSize: 12,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: TOK.cream,
            opacity: 0.88,
          }}
        >
          <span style={{ fontFamily: FONT.serif, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 22 }}>
            Développeur full-stack
          </span>
          <span style={{ opacity: 0.5 }}>—</span>
          <span>Epitech · Rennes</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Spayr · Paris</span>
        </div>
      </div>

    </section>
  );
}
