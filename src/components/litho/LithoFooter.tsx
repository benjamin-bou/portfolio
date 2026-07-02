import { TOK, FONT } from './tokens';

export default function LithoFooter() {
  return (
    <footer
      style={{
        background: TOK.dark,
        color: TOK.cream,
        padding: 'clamp(28px, 4vh, 48px) clamp(24px, 5vw, 80px)',
        borderTop: `1px solid rgba(248,241,225,0.08)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        fontFamily: FONT.mono,
        fontSize: 10,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        opacity: 0.7,
      }}
    >
      <span>© 2026 · B. Boutrois — Rennes / Paris</span>
      <span style={{ display: 'inline-flex', gap: 20 }}>
        <a href="https://github.com/benjamin-bou" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/benjamin-boutrois-2640462b0/"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          LinkedIn
        </a>
      </span>
    </footer>
  );
}
