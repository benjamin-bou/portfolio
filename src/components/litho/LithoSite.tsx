import JourneyLitho from '../journey-variants/JourneyLitho';
import LithoNav from './LithoNav';
import LithoHero from './LithoHero';
import LithoAbout from './LithoAbout';
import LithoMetier from './LithoMetier';
import LithoGallery from './LithoGallery';
import LithoCTA from './LithoCTA';
import LithoFooter from './LithoFooter';
import { TOK, TEXTURES } from './tokens';

/**
 * Full-site Litho variant — replaces the default app shell when hash is #full-litho.
 * Reuses JourneyLitho for the parcours section since it already fits the design.
 */
export default function LithoSite() {
  return (
    <div style={{ background: TOK.dark, color: TOK.cream, minHeight: '100vh', position: 'relative' }}>
      <LithoNav />
      <main>
        <LithoHero />
        <LithoAbout />
        <LithoMetier />
        <LithoGallery />
        <JourneyLitho />
        <LithoCTA />
      </main>
      <LithoFooter />

      {/* Global paper-noise overlay — whisper level, just enough to read as printed */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: TEXTURES.paper,
          mixBlendMode: 'soft-light',
          opacity: 0.18,
          pointerEvents: 'none',
          zIndex: 60,
        }}
      />
    </div>
  );
}
