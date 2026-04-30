import type { ReactNode } from 'react';

type Variant = 'dunes' | 'desk' | 'mountain';

export default function Parallax({
  variant,
  kicker,
  children,
  speed = 0.3,
}: {
  variant: Variant;
  kicker?: string;
  children: ReactNode;
  speed?: number;
}) {
  return (
    <section
      className="relative overflow-hidden flex items-center justify-center isolate parallax-section"
      style={{ height: '60vh', minHeight: 420, maxHeight: 680 }}
      aria-hidden="true"
    >
      <div
        className={`parallax-bg p-${variant}`}
        data-parallax={String(speed)}
      />
      {/* gradient masks */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--deep) 0%, rgba(10,6,4,.1) 18%, rgba(10,6,4,.1) 82%, var(--deep) 100%)',
        }}
      />
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(10,6,4,.55))' }}
      />
      <div
        className="relative z-[2] max-w-[900px] text-center font-serif text-white"
        style={{
          padding: '0 clamp(24px, 5vw, 80px)',
          fontSize: 'clamp(26px, 3.6vw, 52px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {kicker && (
          <span className="block font-mono text-[10px] uppercase tracking-[0.35em] text-orange-hot mb-5.5 before:content-['—_']">
            {kicker}
          </span>
        )}
        {children}
      </div>
    </section>
  );
}
