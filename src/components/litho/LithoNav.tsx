import { useEffect, useState } from 'react';
import { TOK, FONT, LAYOUT } from './tokens';

const LINKS = [
  ['#about', 'Présentation'],
  ['#work', 'Projets'],
  ['#journey', 'Parcours'],
  ['#contact', 'Contact'],
] as const;

export default function LithoNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
        // Aligne logo/liens sur la colonne de contenu (maxW) : sur grand écran
        // le gutter suit celui du contenu au lieu de coller aux bords.
        padding: `18px max(clamp(24px, 4vw, 48px), calc((100vw - ${LAYOUT.maxW}px) / 2))`,
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: TOK.cream,
        // Fond quasi opaque plutôt qu'un backdrop-filter blur (qui repeint une
        // zone floutée à chaque frame de scroll — trop coûteux sur machine modeste).
        background: scrolled ? 'rgba(34, 29, 22, 0.95)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? TOK.lineSoft : 'transparent'}`,
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      <a
        href="#hero"
        style={{
          fontFamily: FONT.display,
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          color: TOK.cream,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Benjamin
        <span className="litho-nav-lastname">
          {' '}
          Boutrois<span style={{ color: TOK.sun }}>.</span>
        </span>
      </a>
      <ul style={{ display: 'flex', gap: 'clamp(16px, 2.6vw, 32px)', listStyle: 'none', margin: 0, padding: 0 }}>
        {LINKS.map(([href, label]) => (
          <li key={href} className={href === '#about' ? 'litho-nav-item-about' : undefined}>
            <a className="litho-nav-link" href={href}>
              {label}
            </a>
          </li>
        ))}
      </ul>
      <style>{`
        .litho-nav-link { color: inherit; text-decoration: none; transition: color 0.2s ease; }
        .litho-nav-link:hover { color: ${TOK.sun}; }
        @media (max-width: 640px) {
          .litho-nav-link { letter-spacing: 0.18em; }
          .litho-nav-item-about { display: none; }
          .litho-nav-lastname { display: none; }
        }
      `}</style>
    </nav>
  );
}
