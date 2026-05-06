const ITEMS = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind', 'Docker', 'Figma', 'Git', 'Vite'];

export default function Marquee() {
  return (
    <section
      className="py-[50px] overflow-hidden relative border-y border-cream/10"
      style={{ background: 'linear-gradient(180deg, transparent, rgba(255,106,31,.03), transparent)' }}
      aria-hidden="true"
    >
      <div
        className="absolute top-0 bottom-0 left-0 w-[120px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, var(--deep), transparent)' }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-[120px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, var(--deep), transparent)' }}
      />
      <div className="marquee">
        {[...ITEMS, ...ITEMS].map((it, i) => (
          <span key={i}>{it}</span>
        ))}
      </div>
    </section>
  );
}
