import { TOK, FONT } from './tokens';

export default function LithoNav() {
  return (
    <nav
      id="litho-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '22px clamp(24px, 4vw, 48px)',
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: TOK.cream,
        mixBlendMode: 'difference',
      }}
    >
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
        B<span style={{ color: TOK.sun }}>·</span>B
      </span>
      <ul style={{ display: 'flex', gap: 26, listStyle: 'none', margin: 0, padding: 0 }}>
        {[
          ['#work', 'Projets'],
          ['#journey', 'Parcours'],
          ['#contact', 'Contact'],
        ].map(([href, label]) => (
          <li key={href}>
            <a href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
