import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type Milestone = {
  year: string;
  title: ReactNode;
  org: string;
  type: 'edu' | 'work';
  typeLabel: string;
  desc: ReactNode;
  ongoing?: boolean;
};

const LICENCE: Milestone = {
  year: '2021 — 2024',
  title: <>Licence <em className="italic text-orange-hot">Informatique</em></>,
  org: 'Université',
  type: 'edu',
  typeLabel: 'Formation · fondations',
  desc: (
    <>
      Algorithmique, structures de données, systèmes, programmation orientée objet. Les
      fondations solides sur lesquelles je{' '}
      <em className="italic text-orange-hot">m'appuie encore tous les jours</em>.
    </>
  ),
};

const BACHELOR: Milestone = {
  year: '2024 — 2025',
  title: <>Bachelor <em className="italic text-orange-hot">Développeur Web</em></>,
  org: 'My-digital-school',
  type: 'edu',
  typeLabel: 'Formation',
  desc: (
    <>
      Spécialisation front et full-stack. React, TypeScript, Node — et l'année où j'ai
      vraiment commencé à me sentir <em className="italic text-orange-hot">développeur</em>,
      pas juste étudiant.
    </>
  ),
};

const CAP: Milestone = {
  year: '2024 — 2025',
  title: <>Alternant <em className="italic text-orange-hot">développeur web</em></>,
  org: 'Cap Achat',
  type: 'work',
  typeLabel: 'Expérience',
  desc: (
    <>
      Ma première alternance. J'y découvre le vrai rythme du métier : lire du code
      existant, faire évoluer un outil utilisé chaque jour, livrer des features qui
      comptent.
    </>
  ),
};

const EPITECH: Milestone = {
  year: '2025 — 2027',
  title: (
    <>
      Master of science{' '}
      <em className="italic text-orange-hot">Administrateur de systèmes d'information</em>
    </>
  ),
  org: 'Epitech',
  type: 'edu',
  typeLabel: 'Formation',
  desc: (
    <>
      Master en cours. Je pousse la technique — systèmes, architecture, projets à
      plusieurs — et je creuse là où le code rencontre le produit.
    </>
  ),
  ongoing: true,
};

const SPAYR: Milestone = {
  year: '2025 — 2027',
  title: <>Alternance <em className="italic text-orange-hot">développeur full-stack</em></>,
  org: 'Spayr',
  type: 'work',
  typeLabel: 'Expérience',
  desc: (
    <>
      Développement produit en startup. React, TypeScript, Node — plus d'autonomie, plus
      d'impact direct sur ce que les utilisateurs voient{' '}
      <em className="italic text-orange-hot">vraiment</em>.
    </>
  ),
  ongoing: true,
};

export default function Journey() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const timeline = timelineRef.current;
    const svg = svgRef.current;
    if (!timeline || !svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>('path');
    const grad = svg.querySelector<SVGLinearGradientElement>('#timeline-glow');

    function center(id: string) {
      const el = document.getElementById(id);
      if (!el || !timeline) return null;
      const tr = timeline.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 };
    }

    function draw() {
      if (!timeline || !svg) return;
      const rect = timeline.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));

      const s = center('dot-start');
      const b = center('dot-bachelor');
      const c = center('dot-cap');
      const e = center('dot-epitech');
      const sp = center('dot-spayr');
      if (!s || !b || !c || !e || !sp) return;

      if (grad) {
        grad.setAttribute('y1', String(s.y));
        grad.setAttribute('y2', String(Math.max(e.y, sp.y)));
      }

      const splitY = s.y + (c.y - s.y) * 0.28;
      const d1 = `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
      const dy = c.y - splitY;
      const d2 = `M ${s.x} ${splitY} C ${s.x} ${splitY + dy * 0.55}, ${c.x} ${c.y - dy * 0.55}, ${c.x} ${c.y} L ${sp.x} ${sp.y}`;

      const ds = [d1, d2];
      paths.forEach((p, i) => {
        p.setAttribute('d', ds[i] || '');
        try {
          const len = p.getTotalLength();
          p.style.setProperty('--len', String(len));
        } catch {
          /* */
        }
      });
    }

    const drawSoon = () => requestAnimationFrame(draw);
    window.addEventListener('load', drawSoon);
    window.addEventListener('resize', drawSoon);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawSoon);
    drawSoon();

    const tio = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            draw();
            requestAnimationFrame(() => timeline!.classList.add('in'));
            const milestones = timeline!.querySelectorAll('.milestone');
            milestones.forEach((m, i) => {
              setTimeout(() => m.classList.add('in'), 300 + i * 180);
            });
            tio.unobserve(timeline!);
          }
        });
      },
      { threshold: 0.2 },
    );
    tio.observe(timeline);

    return () => {
      window.removeEventListener('load', drawSoon);
      window.removeEventListener('resize', drawSoon);
      tio.disconnect();
    };
  }, []);

  return (
    <section
      id="journey"
      className="journey relative max-w-[1400px] mx-auto overflow-hidden"
      style={{ padding: 'clamp(80px, 12vh, 140px) clamp(24px, 5vw, 80px) clamp(60px, 10vh, 120px)' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          left: '-20%',
          top: '10%',
          width: '60vw',
          height: '60vw',
          background: 'radial-gradient(circle, rgba(255,106,31,.1), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="reveal chapter-tag font-mono text-[11px] uppercase tracking-[0.3em] text-orange mb-10 inline-flex items-center gap-3.5">
        Chapitre III · Le parcours
      </div>
      <div className="max-w-[720px] mb-20">
        <h2
          className="reveal delay-1 font-serif font-normal mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 92px)', lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          Deux trajets en <em className="italic text-orange-hot">parallèle</em> : l'école
          et l'alternance.
        </h2>
        <p
          className="reveal delay-2 font-serif text-cream/75 max-w-[44ch]"
          style={{ fontSize: 'clamp(18px, 1.6vw, 24px)', lineHeight: 1.5 }}
        >
          Cinq ans à construire mon profil de développeur — la théorie d'un côté
          (Licence, Bachelor, Epitech), la pratique en entreprise de l'autre. Les deux se
          nourrissent.
        </p>
      </div>

      <div ref={timelineRef} className="timeline relative max-w-[1100px] mx-auto" id="timeline">
        <svg ref={svgRef} className="timeline-svg" aria-hidden="true">
          <defs>
            <linearGradient id="timeline-glow" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="100">
              <stop offset="0" stopColor="#ffd28a" />
              <stop offset=".5" stopColor="#ff6a1f" />
              <stop offset="1" stopColor="#ff3a0a" />
            </linearGradient>
          </defs>
          <path className="p1" d="" />
          <path className="p2" d="" />
        </svg>

        <BranchLabels />

        <TimelineRow
          left={<MilestoneCard m={LICENCE} dotId="dot-start" side="left" />}
          right={null}
        />
        <TimelineRow
          left={<MilestoneCard m={BACHELOR} dotId="dot-bachelor" side="left" />}
          right={<MilestoneCard m={CAP} dotId="dot-cap" side="right" />}
        />
        <TimelineRow
          left={<MilestoneCard m={EPITECH} dotId="dot-epitech" side="left" />}
          right={<MilestoneCard m={SPAYR} dotId="dot-spayr" side="right" />}
        />
      </div>
    </section>
  );
}

function BranchLabels() {
  return (
    <div className="hidden md:grid relative z-[2] py-7 grid-cols-[1fr_auto_1fr] items-center"
      style={{ gap: 'clamp(30px, 5vw, 80px)' }}
    >
      <div className="text-right font-mono text-[11px] uppercase tracking-[0.3em] text-orange-hot opacity-75">← Formation</div>
      <div className="w-2.5 h-2.5 rounded-full bg-orange shadow-[0_0_14px_var(--orange)]" />
      <div className="text-left font-mono text-[11px] uppercase tracking-[0.3em] text-orange-hot opacity-75">Expérience →</div>
    </div>
  );
}

function TimelineRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div
      className="grid relative z-[2] py-7 grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start"
      style={{ gap: 'clamp(30px, 5vw, 80px)' }}
    >
      <div className="flex gap-4.5 md:justify-end items-start md:text-right max-md:pl-10 max-md:relative">
        {left}
      </div>
      <div className="hidden md:block w-0.5" />
      <div className="flex gap-4.5 justify-start items-start text-left max-md:pl-10 max-md:relative">
        {right}
      </div>
    </div>
  );
}

function MilestoneCard({
  m,
  dotId,
  side,
}: {
  m: Milestone;
  dotId: string;
  side: 'left' | 'right';
}) {
  const dot = (
    <div className="dot mt-2 max-md:absolute max-md:left-2.5 max-md:top-1" id={dotId} />
  );
  const content = (
    <div className={`milestone ${m.ongoing ? 'ongoing' : ''}`}>
      <div
        className={`milestone-year font-mono text-xs tracking-[0.2em] text-orange-hot mb-2 inline-flex items-center gap-2.5 flex-wrap ${
          side === 'left' ? 'md:justify-end' : ''
        }`}
      >
        {m.year}
      </div>
      <h4
        className="font-serif font-normal text-white mb-1.5"
        style={{ fontSize: 'clamp(22px, 2.4vw, 32px)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
      >
        {m.title}
      </h4>
      <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream/65 mb-2.5">
        {m.org}
      </div>
      <span
        className={`inline-block text-[10px] uppercase tracking-[0.2em] py-[3px] px-2.5 rounded-full mb-2.5 ${
          m.type === 'edu'
            ? 'text-orange-hot border border-orange-hot/30'
            : 'text-orange border border-orange/40'
        }`}
        style={{
          background: m.type === 'edu' ? 'rgba(255,176,87,.15)' : 'rgba(255,106,31,.2)',
        }}
      >
        {m.typeLabel}
      </span>
      <p className="font-serif text-base leading-[1.5] text-cream/70 mt-1">{m.desc}</p>
    </div>
  );

  return side === 'left' ? (
    <>
      {content}
      {dot}
    </>
  ) : (
    <>
      {dot}
      {content}
    </>
  );
}
