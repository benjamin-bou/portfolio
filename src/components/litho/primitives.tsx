import type { CSSProperties, ReactNode } from 'react';
import { TOK, FONT } from './tokens';

/** Kicker de chapitre — rendu identique dans toutes les sections. */
export function Kicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 11,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: TOK.sun,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        ...style,
      }}
    >
      <span aria-hidden style={{ width: 28, height: 1, background: TOK.sun, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}

/** Point final orange — signature typographique des titres. */
export function Dot() {
  return <span style={{ color: TOK.sun }}>.</span>;
}

/** Bloc d'information étiqueté — hero et CTA partagent ce rendu. */
export function InfoBlock({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: TOK.creamMuted,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: FONT.serif, fontSize: 21, color: TOK.cream, lineHeight: 1.25 }}>{title}</div>
      {sub && (
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: TOK.creamMuted,
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
