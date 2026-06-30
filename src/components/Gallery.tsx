import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type Project = {
  index: string;
  title: ReactNode;
  meta: ReactNode;
  tags: string[];
  bgClass: string;
  illus: ReactNode;
  delay: 0 | 1 | 2 | 3;
};

const PROJECTS: Project[] = [
  {
    index: '01 / Alternance · Spayr',
    title: (
      <>
        Développement produit en <em className="italic text-orange-hot">startup</em>.
      </>
    ),
    meta: (
      <>
        <span className="status-dot" />
        En cours · 2025
      </>
    ),
    tags: ['React', 'TypeScript', 'Node'],
    bgClass: 'card-1',
    delay: 0,
    illus: (
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffd28a" stopOpacity=".9" />
            <stop offset="1" stopColor="#ff6a1f" stopOpacity=".2" />
          </linearGradient>
        </defs>
        <rect x="30" y="60" width="240" height="180" rx="6" fill="rgba(15,8,4,.65)" stroke="rgba(255,210,138,.3)" />
        <circle cx="44" cy="74" r="3" fill="#ff5f57" />
        <circle cx="56" cy="74" r="3" fill="#ffbd2e" />
        <circle cx="68" cy="74" r="3" fill="#28ca42" />
        <rect x="90" y="68" width="170" height="12" rx="3" fill="rgba(255,255,255,.06)" />
        <rect x="42" y="94" width="100" height="30" rx="3" fill="url(#g1)" opacity=".85" />
        <rect x="150" y="94" width="108" height="30" rx="3" fill="rgba(255,255,255,.08)" />
        <rect x="42" y="132" width="216" height="50" rx="3" fill="rgba(255,255,255,.05)" />
        <g transform="translate(50,142)">
          <rect x="0" y="20" width="10" height="30" fill="#ffb057" />
          <rect x="16" y="8" width="10" height="42" fill="#ff6a1f" />
          <rect x="32" y="14" width="10" height="36" fill="#ffd28a" />
          <rect x="48" y="2" width="10" height="48" fill="#ff6a1f" />
          <rect x="64" y="18" width="10" height="32" fill="#ffb057" />
          <rect x="80" y="24" width="10" height="26" fill="#ffd28a" />
          <rect x="96" y="10" width="10" height="40" fill="#ff6a1f" />
          <rect x="112" y="16" width="10" height="34" fill="#ffb057" />
        </g>
        <rect x="42" y="190" width="216" height="40" rx="3" fill="rgba(255,255,255,.04)" />
        <circle cx="240" cy="310" r="60" fill="#ff6a1f" opacity=".25" />
      </svg>
    ),
  },
  {
    index: '02 / Alternance · Cap Achat',
    title: (
      <>
        Refonte d'un <em className="italic text-orange-hot">outil métier</em>.
      </>
    ),
    meta: '2024 — 2025',
    tags: ['React', 'API REST', 'UX'],
    bgClass: 'card-2',
    delay: 1,
    illus: (
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
        <rect x="24" y="70" width="252" height="260" rx="4" fill="rgba(15,8,4,.7)" stroke="rgba(255,106,31,.25)" />
        <rect x="24" y="70" width="252" height="32" fill="rgba(255,106,31,.15)" />
        <text x="40" y="90" fill="#ffd28a" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2">
          PRODUITS · 128
        </text>
        <g fontFamily="JetBrains Mono" fontSize="9" fill="rgba(243,232,216,.7)">
          <line x1="24" y1="128" x2="276" y2="128" stroke="rgba(255,255,255,.05)" />
          <text x="40" y="122">REF-001</text>
          <rect x="120" y="114" width="80" height="8" rx="1" fill="#ff6a1f" opacity=".6" />
          <text x="220" y="122">€1,240</text>
          <line x1="24" y1="152" x2="276" y2="152" stroke="rgba(255,255,255,.05)" />
          <text x="40" y="146">REF-002</text>
          <rect x="120" y="138" width="50" height="8" rx="1" fill="#ffb057" opacity=".5" />
          <text x="220" y="146">€890</text>
          <line x1="24" y1="176" x2="276" y2="176" stroke="rgba(255,255,255,.05)" />
          <text x="40" y="170">REF-003</text>
          <rect x="120" y="162" width="110" height="8" rx="1" fill="#ff6a1f" opacity=".7" />
          <text x="220" y="170">€2,105</text>
          <line x1="24" y1="200" x2="276" y2="200" stroke="rgba(255,255,255,.05)" />
          <text x="40" y="194">REF-004</text>
          <rect x="120" y="186" width="30" height="8" rx="1" fill="#ffd28a" opacity=".4" />
          <text x="220" y="194">€445</text>
          <line x1="24" y1="224" x2="276" y2="224" stroke="rgba(255,255,255,.05)" />
          <text x="40" y="218">REF-005</text>
          <rect x="120" y="210" width="95" height="8" rx="1" fill="#ff6a1f" opacity=".65" />
          <text x="220" y="218">€1,670</text>
          <text x="40" y="242">REF-006</text>
          <rect x="120" y="234" width="70" height="8" rx="1" fill="#ffb057" opacity=".5" />
          <text x="220" y="242">€1,020</text>
        </g>
        <circle cx="60" cy="340" r="80" fill="#ff6a1f" opacity=".2" />
      </svg>
    ),
  },
  {
    index: '03 / Projet école',
    title: (
      <>
        Une application <em className="italic text-orange-hot">full-stack</em>, de bout en bout.
      </>
    ),
    meta: 'Epitech · 2025',
    tags: ['Next.js', 'Postgres', 'Auth'],
    bgClass: 'card-3',
    delay: 2,
    illus: (
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
        <rect x="50" y="80" width="180" height="220" rx="8" fill="rgba(15,8,4,.6)" stroke="rgba(255,210,138,.25)" transform="rotate(-4 140 190)" />
        <rect x="70" y="100" width="180" height="220" rx="8" fill="rgba(15,8,4,.8)" stroke="rgba(255,210,138,.4)" transform="rotate(3 160 210)" />
        <g transform="rotate(3 160 210)">
          <rect x="90" y="130" width="140" height="10" rx="2" fill="#ffd28a" opacity=".8" />
          <rect x="90" y="150" width="100" height="6" rx="1" fill="rgba(255,255,255,.3)" />
          <rect x="90" y="180" width="140" height="24" rx="3" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" />
          <rect x="90" y="214" width="140" height="24" rx="3" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" />
          <rect x="90" y="252" width="140" height="28" rx="3" fill="#ff6a1f" />
          <text x="160" y="270" fill="#0a0604" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" letterSpacing="2" fontWeight="500">
            SE CONNECTER
          </text>
        </g>
        <g fontFamily="JetBrains Mono" fontSize="8" fill="rgba(255,210,138,.6)">
          <text x="20" y="50">{'{user.id}'}</text>
          <text x="220" y="60">async()</text>
          <text x="30" y="360">await db</text>
          <text x="210" y="370">200 OK</text>
        </g>
        <circle cx="250" cy="70" r="40" fill="#ffd28a" opacity=".2" />
      </svg>
    ),
  },
  {
    index: '04 / Projet perso',
    title: (
      <>
        Ce <em className="italic text-orange-hot">portfolio</em>, entièrement fait main.
      </>
    ),
    meta: '2026 · ici même',
    tags: ['HTML', 'CSS', 'JS'],
    bgClass: 'card-4',
    delay: 3,
    illus: (
      <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="sunc" cx=".5" cy="1" r=".8">
            <stop offset="0" stopColor="#ffd28a" />
            <stop offset=".5" stopColor="#ff6a1f" stopOpacity=".6" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="150" cy="280" r="150" fill="url(#sunc)" />
        <g stroke="rgba(255,210,138,.5)" fill="none">
          <line x1="0" y1="200" x2="300" y2="200" />
          <line x1="0" y1="215" x2="300" y2="215" opacity=".7" />
          <line x1="0" y1="232" x2="300" y2="232" opacity=".5" />
          <line x1="0" y1="252" x2="300" y2="252" opacity=".35" />
          <line x1="0" y1="275" x2="300" y2="275" opacity=".22" />
        </g>
        <text x="50" y="130" fill="rgba(255,210,138,.7)" fontFamily="Instrument Serif" fontStyle="italic" fontSize="70">
          {'</>'}
        </text>
        <text x="50" y="170" fill="rgba(243,232,216,.5)" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="2">
          hand-crafted
        </text>
      </svg>
    ),
  },
];

export default function Gallery() {
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Card tilt effect
  useEffect(() => {
    const cards = trackRef.current?.querySelectorAll<HTMLElement>('[data-tilt]') || [];
    const cleanups: (() => void)[] = [];
    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-10px) perspective(1000px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
      };
      const leave = () => {
        card.style.transform = '';
      };
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', move);
        card.removeEventListener('mouseleave', leave);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <section
      className="gallery relative overflow-hidden"
      id="work"
      style={{ padding: 'clamp(60px, 10vh, 120px) 0' }}
    >
      <div
        className="flex justify-between items-end mb-12 max-w-[1400px] mx-auto flex-wrap gap-4"
        style={{ padding: '0 clamp(24px, 5vw, 80px)' }}
      >
        <div className="reveal font-mono text-[11px] uppercase tracking-[0.3em] text-orange inline-flex items-center gap-3.5">
          <span className="w-[30px] h-px bg-orange" />
          Chapitre III · Quelques projets
        </div>
        <div className="reveal delay-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          4 projets · alternance, école, personnels · faire défiler →
        </div>
      </div>

      <div
        ref={trackRef}
        className="track flex gap-7 overflow-x-auto pb-5"
        style={{
          padding: '0 clamp(24px, 5vw, 80px) 20px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {PROJECTS.map((p, i) => (
          <article
            key={i}
            data-tilt
            className={`card reveal delay-${p.delay} relative overflow-hidden bg-ember rounded-[3px] flex-none`}
            style={{
              flexBasis: 'clamp(280px, 34vw, 480px)',
              aspectRatio: '3 / 4',
              scrollSnapAlign: 'start',
            }}
          >
            <div className={`card-bg ${p.bgClass}`} />
            <div className="absolute inset-0 z-[1] overflow-hidden">{p.illus}</div>
            <div className="absolute inset-3.5 border border-white/10 rounded-[2px] z-[2] pointer-events-none" />
            <Corners />
            <div className="absolute inset-0 z-[2] flex flex-col justify-between text-white p-[26px]">
              <div className="font-mono text-[11px] tracking-[0.25em] text-white/75">{p.index}</div>
              <div>
                <div
                  className="font-serif font-normal"
                  style={{ fontSize: 'clamp(22px, 2.4vw, 34px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
                >
                  {p.title}
                </div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/80 mt-1.5 flex items-center">
                  {p.meta}
                </div>
                <div className="flex gap-1.5 flex-wrap mt-2.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] uppercase tracking-[0.15em] py-0.5 px-2 rounded-full text-orange-glow/90"
                      style={{
                        background: 'rgba(0,0,0,.4)',
                        border: '1px solid rgba(255,210,138,.3)',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Corners() {
  return (
    <>
      <span className="absolute top-3.5 left-3.5 w-3.5 h-3.5 z-[3] border-t border-l border-orange-glow/80" />
      <span className="absolute top-3.5 right-3.5 w-3.5 h-3.5 z-[3] border-t border-r border-orange-glow/80" />
      <span className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 z-[3] border-b border-l border-orange-glow/80" />
      <span className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 z-[3] border-b border-r border-orange-glow/80" />
    </>
  );
}
