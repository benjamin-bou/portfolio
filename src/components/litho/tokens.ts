import type { CSSProperties } from 'react';

/**
 * Litho v2 — design system.
 *
 * Direction : affiche lithographique éditoriale, sombre et chaude.
 * Règles de cohérence :
 *  - Deux niveaux de fond (bg / bgDeep) alternent pour rythmer les sections.
 *  - L'encre crème a trois intensités (cream / creamSoft / creamMuted).
 *  - UN accent (sun), réservé aux éléments structurels : kickers de chapitre,
 *    numéros, point final des titres, états hover, voie alternance du parcours.
 *  - Tous les titres de section partagent la même échelle (TYPE.h2).
 */
export const TOK = {
  // Surfaces
  bg: '#2E2820', // base — warm dark, paper feel
  bgDeep: '#262119', // bande plus profonde, alterne avec bg
  panel: '#383026', // surface levée (cartes)
  // Encres
  cream: '#F0E7D4',
  creamSoft: 'rgba(240, 231, 212, 0.78)',
  creamMuted: 'rgba(240, 231, 212, 0.55)',
  creamFaint: 'rgba(240, 231, 212, 0.34)',
  // Hairlines
  line: 'rgba(240, 231, 212, 0.16)',
  lineSoft: 'rgba(240, 231, 212, 0.09)',
  // Accent unique
  sun: '#E27A2E',
  sunSoft: 'rgba(226, 122, 46, 0.14)',
  // Teinte réservée au grading photo
  peach: '#E2D6BD',
  ink: '#262119',
};

export const FONT = {
  display: "'Bricolage Grotesque', sans-serif",
  serif: "'Instrument Serif', serif",
  mono: "'JetBrains Mono', monospace",
};

export const TYPE: Record<'h2' | 'body' | 'meta', CSSProperties> = {
  /** Titre de section — échelle unique pour tout le site. */
  h2: {
    fontFamily: FONT.display,
    fontWeight: 800,
    fontSize: 'clamp(42px, 5.6vw, 88px)',
    lineHeight: 0.92,
    letterSpacing: '-0.025em',
    textTransform: 'uppercase',
    color: TOK.cream,
    margin: 0,
  },
  /** Corps de texte éditorial. */
  body: {
    fontFamily: FONT.serif,
    fontSize: 'clamp(17px, 1.4vw, 21px)',
    lineHeight: 1.6,
    color: TOK.creamSoft,
  },
  /** Méta mono — légendes, années, indications. */
  meta: {
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: TOK.creamMuted,
  },
};

export const LAYOUT = {
  // Largeur max du contenu — assez large pour remplir les grands écrans
  // (sur 1920 : ~160px de marge de chaque côté) sans allonger le texte
  // (les paragraphes gardent leurs propres limites en ch).
  maxW: 1600,
  padX: 'clamp(24px, 5vw, 80px)',
  sectionPad: 'clamp(90px, 14vh, 170px) clamp(24px, 5vw, 80px)',
};

/**
 * Litho grain — halftone dot grid + light diagonal hatching.
 * Reads as "printed affiche" rather than the digital noise/turbulence look.
 */
export const TEXTURES = {
  grain: [
    // Halftone dots — 5px grid, very subtle
    'radial-gradient(circle, rgba(26,18,9,0.05) 0.4px, transparent 1.2px) 0 0 / 5px 5px',
    // Diagonal hatching — barely perceptible
    'repeating-linear-gradient(35deg, transparent 0 6px, rgba(240,231,212,0.012) 6px 7px)',
  ].join(', '),
  /** Whisper-level dot pattern for global overlay */
  paper:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='7' height='7'><circle cx='3.5' cy='3.5' r='0.55' fill='%23413830'/></svg>\")",
};
