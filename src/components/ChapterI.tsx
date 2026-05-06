export default function ChapterI() {
  return (
    <section
      className="chapter-i relative max-w-[1400px] mx-auto"
      style={{ padding: 'clamp(80px, 18vh, 200px) clamp(24px, 5vw, 80px)' }}
    >
      <div className="reveal chapter-tag font-mono text-[11px] uppercase tracking-[0.3em] text-orange mb-10 inline-flex items-center gap-3.5">
        Chapitre I · Ce que je fais
      </div>
      <h2
        className="reveal delay-1 font-serif font-normal text-white max-w-[18ch] mb-12"
        style={{
          fontSize: 'clamp(40px, 6vw, 92px)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        <span className="whitespace-nowrap">Je suis développeur <em className="italic text-orange-hot">full-stack</em>.</span><br />J'aime peaufiner une interface, concevoir une <em className="italic text-orange-hot">API</em>, orchestrer un <em className="italic text-orange-hot">déploiement</em>.
      </h2>
      <p
        className="reveal delay-2 font-serif max-w-[32ch] text-cream/85"
        style={{ fontSize: 'clamp(22px, 2.2vw, 34px)', lineHeight: 1.4 }}
      >
        À travers les projets <em className="italic text-orange-hot">d'école</em> et
        l'<em className="italic text-orange-hot">alternance</em>, j'ai appris à intervenir
        sur toutes les couches d'un projet.
      </p>

      <div className="reveal delay-3 mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-[1200px]">
        <TechCol label="Frontend" items={['React · TypeScript', 'CSS · Tailwind', 'Responsive design', 'Accessibilité']} />
        <TechCol label="Backend" items={['PHP · Laravel', 'Ruby · Rails', 'API REST', 'PostgreSQL · MySQL']} />
        <TechCol label="DevOps" items={['Docker · CI/CD', 'VPS', 'Monitoring', 'Tests automatisés']} />
        <TechCol label="Outils" items={['Git & review', 'Figma & design', 'VS Code · JetBrains', 'Notion · Jira']} />
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
