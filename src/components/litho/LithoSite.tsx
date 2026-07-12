import JourneyFilm from '../journey-variants/JourneyFilm';
import LithoNav from './LithoNav';
import LithoHero from './LithoHero';
import LithoAbout from './LithoAbout';
import LithoMetier from './LithoMetier';
import LithoGallery from './LithoGallery';
import LithoCTA from './LithoCTA';
import LithoFooter from './LithoFooter';
import { TOK } from './tokens';

/**
 * Site litho — shell unique du portfolio.
 * Rythme des fonds : photo (hero) → bg (about) → bgDeep (métier) → bg (projets)
 * → parcours → bgDeep (contact, footer).
 */
export default function LithoSite() {
  return (
    <div style={{ background: TOK.bg, color: TOK.cream, minHeight: '100vh', position: 'relative' }}>
      <LithoNav />
      <main>
        <LithoHero />
        <LithoAbout />
        <LithoMetier />
        <LithoGallery />
        <JourneyFilm />
        <LithoCTA />
      </main>
      <LithoFooter />
    </div>
  );
}
// NOTE PERF : l'ancien calque papier global était `position: fixed` +
// mix-blend-mode soft-light plein écran → le navigateur re-blendait tout le
// viewport contre le contenu défilant à CHAQUE frame (saccade sur tout le site,
// dès le hero). Supprimé ; le grain par section (sans blend) suffit à la texture.
