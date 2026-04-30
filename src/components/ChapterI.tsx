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
        Du <em className="italic text-orange-hot">front</em> au{' '}
        <em className="italic text-orange-hot">back</em>, une continuité — pas deux mondes.
      </h2>
      <p
        className="reveal delay-2 font-serif max-w-[32ch] text-cream/85"
        style={{ fontSize: 'clamp(22px, 2.2vw, 34px)', lineHeight: 1.4 }}
      >
        J'aime les interfaces <em className="italic text-orange-hot">soignées</em> autant
        que les API claires. Je choisis des technologies éprouvées, j'écris du code
        lisible, et je soigne ce que l'utilisateur voit comme ce que l'équipe d'après lira.
      </p>

      <div className="reveal delay-3 mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px]">
        <TechCol label="Interface" items={['React · TypeScript', 'Tailwind · Motion', 'Design systems', 'Accessibilité']} />
        <TechCol label="Serveur" items={['Node · Express', 'PostgreSQL', 'API REST', 'Authentification']} />
        <TechCol label="Au quotidien" items={['Git & revue de code', 'Tests automatisés', 'Docker · CI/CD', 'Figma & design']} />
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
