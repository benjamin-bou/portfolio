export default function ChapterI() {
  return (
    <section
      className="chapter-i relative max-w-[1400px] mx-auto"
      style={{ padding: 'clamp(80px, 18vh, 200px) clamp(24px, 5vw, 80px)' }}
    >
      <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 items-start">
        <div className="md:sticky md:top-32">
          <div className="reveal chapter-tag font-mono text-[11px] uppercase tracking-[0.3em] text-orange mb-8 inline-flex items-center gap-3.5">
            <span className="w-[30px] h-px bg-orange" />
            Chapitre II · Le métier
          </div>
          <h2
            className="reveal delay-1 font-serif font-normal text-white mb-6"
            style={{ fontSize: 'clamp(40px, 5vw, 76px)', lineHeight: 1, letterSpacing: '-0.025em' }}
          >
            Mon <em className="italic text-orange-hot">métier</em>.
          </h2>
          <p className="reveal delay-2 font-mono text-xs uppercase tracking-[0.22em] text-cream/55 leading-relaxed">
            Développeur full-stack
            <br />
            React · Laravel · DevOps
          </p>
        </div>

        <div className="reveal delay-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TechCol label="Frontend" items={['React · TypeScript', 'CSS · Tailwind', 'Responsive design', 'Accessibilité']} />
          <TechCol label="Backend" items={['PHP · Laravel', 'Ruby · Rails', 'API REST', 'PostgreSQL · MySQL']} />
          <TechCol label="DevOps" items={['Docker · CI/CD', 'VPS', 'Monitoring', 'Tests automatisés']} />
          <TechCol label="Outils" items={['Git & review', 'Figma & design', 'Claude Code', 'Notion · Jira']} />
        </div>
      </div>
    </section>
  );
}

function TechCol({ label, items }: { label: string; items: string[] }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg p-6 transition-all duration-400 hover:-translate-y-1 hover:border-orange-hot/50 hover:shadow-[0_10px_40px_rgba(255,106,31,0.15)]"
      style={{
        background: 'rgba(20,10,6,.5)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,176,87,.18)',
      }}
    >
      <div className="font-serif italic text-[18px] text-orange-hot mb-4 flex items-center gap-2.5">
        <span className="w-[18px] h-px bg-orange-hot opacity-60" />
        {label}
      </div>
      <ul className="list-none flex flex-col gap-2">
        {items.map((it) => (
          <li key={it} className="font-serif text-base text-cream/80 leading-snug">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
