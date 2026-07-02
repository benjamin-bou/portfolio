/**
 * Litho design tokens — shared across all litho-styled sections.
 * Aesthetic: PLM affiche meets editorial photography. Two surfaces (warm light peach
 * + warm dark brown), one saturated accent (vermillon), litho grain texture.
 */
export const TOK = {
  // Surfaces — lifted warm-neutral dark (less pitch black, more paper-feel)
  peach: '#E2D6BD', // light surface — neutral sand/linen accent (used sparingly now)
  cream: '#F0E7D4', // soft cream for text on dark / soft accents
  dark: '#2E2820', // warm-neutral dark, lifted from #1B1815 for paper feel
  panel: '#3B312A', // raised panel on dark — more contrast
  // Accents
  sun: '#E27A2E', // burnt orange — warmer, less red, still print-affiche feel
  sunRim: '#F2A45A', // softer orange for halos
  // Misc
  ink: '#2E2820', // text on light surfaces
  cool: '#3A5266', // cool mid-tone — sparingly, breaks the monochrome
  mutedCream: 'rgba(240, 231, 212, 0.55)',
  mutedInk: 'rgba(46, 40, 32, 0.6)',
};

export const FONT = {
  display: "'Bricolage Grotesque', sans-serif",
  serif: "'Instrument Serif', serif",
  mono: "'JetBrains Mono', monospace",
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
