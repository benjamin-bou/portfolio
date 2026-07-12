import { TOK, FONT, LAYOUT } from './tokens';

export default function LithoFooter() {
  return (
    <footer
      style={{
        background: TOK.bgDeep,
        color: TOK.creamMuted,
        padding: `clamp(28px, 4vh, 48px) ${LAYOUT.padX}`,
        borderTop: `1px solid ${TOK.lineSoft}`,
        fontFamily: FONT.mono,
        fontSize: 10,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
      }}
    >
      Benjamin Boutrois
    </footer>
  );
}
