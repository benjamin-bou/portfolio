const STEPS = [
  { num: 'i', title: 'Écouter', desc: "Comprendre le besoin réel, pas celui qu'on croit entendre. Poser les bonnes questions." },
  { num: 'ii', title: 'Esquisser', desc: "Figma, papier, prototypes rapides. Tester l'idée avant de l'écrire en dur." },
  { num: 'iii', title: 'Construire', desc: 'Du code lisible, typé, testable. Des commits clairs, des PRs courtes.' },
  { num: 'iv', title: 'Itérer', desc: 'Livrer, écouter, ajuster. Le produit mûrit au contact du réel.' },
];

export default function Process() {
  return (
    <section
      className="max-w-[1400px] mx-auto"
      style={{ padding: 'clamp(60px, 10vh, 120px) clamp(24px, 5vw, 80px)' }}
    >
      <h3
        className="reveal font-serif font-normal mb-12"
        style={{ fontSize: 'clamp(30px, 4vw, 56px)', letterSpacing: '-0.02em' }}
      >
        Ma <em className="italic text-orange-hot">manière</em> de faire.
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
        <div
          className="absolute top-[30px] left-[5%] right-[5%] h-px z-0"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,176,87,.4), rgba(255,176,87,.4), transparent)',
          }}
        />
        {STEPS.map((s, i) => (
          <div key={i} className={`reveal delay-${(i + 1) as 1 | 2 | 3 | 4} relative z-[1] group`}>
            <div
              className="step-num w-[60px] h-[60px] rounded-full flex items-center justify-center font-serif italic text-[26px] text-orange-hot mb-4.5 transition-all duration-400 relative group-hover:bg-orange group-hover:text-white group-hover:border-orange group-hover:shadow-[0_0_24px_rgba(255,106,31,.5)]"
              style={{
                background: 'var(--deep)',
                border: '1px solid rgba(255,176,87,.4)',
              }}
            >
              {s.num}
            </div>
            <h4 className="font-serif text-[22px] font-normal text-white mb-2" style={{ letterSpacing: '-0.01em' }}>
              <em className="italic text-orange-hot">{s.title}</em>
            </h4>
            <p className="font-serif text-[15px] leading-[1.6] text-cream/70">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
