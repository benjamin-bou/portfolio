export default function About() {
  return (
    <section
      id="about"
      className="relative max-w-[1400px] mx-auto"
      style={{ padding: 'clamp(80px, 16vh, 180px) clamp(24px, 5vw, 80px)' }}
    >
      <div className="grid md:grid-cols-[3fr_2fr] gap-12 md:gap-20 items-start">
        {/* Left */}
        <div>
          <div className="reveal font-mono text-[11px] uppercase tracking-[0.3em] text-orange mb-8 inline-flex items-center gap-3.5">
            <span className="w-[30px] h-px bg-orange" />
            Chapitre I · Présentation
          </div>

          <h2
            className="reveal delay-1 font-serif font-normal text-white mb-10"
            style={{ fontSize: 'clamp(40px, 5.5vw, 84px)', lineHeight: 1, letterSpacing: '-0.025em' }}
          >
            Développeur, <em className="italic text-orange-hot">coureur</em>,{' '}
            <em className="italic text-orange-hot">randonneur</em>.
          </h2>

          <div
            className="reveal delay-2 font-serif text-cream/85 space-y-5 max-w-[54ch]"
            style={{ fontSize: 'clamp(17px, 1.4vw, 20px)', lineHeight: 1.65 }}
          >
            <p>
              Je m'appelle <em className="italic text-orange-hot">Benjamin</em>, j'ai 23 ans.
              Je suis en alternance depuis <em className="italic text-orange-hot">septembre 2024</em>,
              et plus précisément à <em className="italic text-orange-hot">Epitech Rennes</em> côté
              école et chez <em className="italic text-orange-hot">Spayr</em> à Paris depuis{' '}
              <em className="italic text-orange-hot">septembre 2025</em>.
            </p>
            <p>
              J'aime essayer des trucs — un nouvel outil, un side-project le week-end, un format
              que je n'ai jamais touché. J'aime bricoler avec des nouveaux outils et tester des
              nouveaux projets avec l'IA.
            </p>
            <p>
              À côté je cours environ 4 sorties par semaine. J'ai déjà fini plusieurs
              semi-marathons et je prépare mon premier marathon pour l'été 2026.
            </p>
            <p>
              J'aime aussi voyager et changer de décor dès que je peux — un week-end à l'autre
              bout de la France, un voyage improvisé avec mes amis, peu importe : c'est dans ces
              moments-là que je recharge vraiment.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="reveal delay-3 flex flex-col gap-6 md:sticky md:top-32">
          <figure
            className="relative m-0 overflow-hidden rounded-lg"
            style={{
              aspectRatio: '4 / 5',
              border: '1px solid rgba(255,176,87,.18)',
              boxShadow: '0 24px 60px rgba(0,0,0,.55), 0 0 30px rgba(255,106,31,.08)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80"
              alt="Sentier de montagne au coucher du soleil"
              className="w-full h-full block object-cover"
              style={{ filter: 'saturate(1.1) contrast(1.05)' }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,106,31,.12) 0%, transparent 30%, rgba(10,6,4,.75) 100%)',
                mixBlendMode: 'multiply',
              }}
            />
            <figcaption className="absolute bottom-0 left-0 right-0 p-5 z-[1]">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange-hot mb-1.5">
                Été 2025
              </div>
              <div className="font-serif italic text-cream text-lg leading-tight">
                Quelque part sur le GR20, Corse.
              </div>
            </figcaption>
          </figure>

          <ul className="list-none m-0 p-0 pt-2 flex flex-col">
            {[
              <>Alternant <em className="italic text-orange-hot">développeur full-stack</em> chez Spayr, à Paris.</>,
              <>En <em className="italic text-orange-hot">Master of Science</em> à Epitech Rennes, parcours administrateur SI.</>,
              <>Curieux des outils et de l'<em className="italic text-orange-hot">IA appliquée</em> au produit.</>,
              <>Hors écran : <em className="italic text-orange-hot">course à pied</em> et <em className="italic text-orange-hot">randonnée</em> longue distance.</>,
            ].map((content, i, arr) => (
              <li
                key={i}
                className="flex gap-[18px] items-baseline font-serif text-cream"
                style={{
                  fontSize: 19,
                  lineHeight: 1.45,
                  paddingBottom: i === arr.length - 1 ? 0 : 18,
                  paddingTop: i === 0 ? 0 : 18,
                  borderBottom: i === arr.length - 1 ? 'none' : '1px solid rgba(255,176,87,.12)',
                }}
              >
                <span
                  className="font-mono shrink-0"
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,176,87,.55)',
                    letterSpacing: '.1em',
                    transform: 'translateY(-1px)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{content}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
