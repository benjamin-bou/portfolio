import { useEffect, useRef, useState } from 'react';
import { STOPS } from './data';
import { useScrollProgress } from './useScrollProgress';
import { TOK, FONT, TEXTURES } from '../litho/tokens';

/**
 * Parcours — film en actes piloté par le scroll, lisible année par année :
 * chaque acte = une ère (les années en bandeau haut), ce que j'y ai fait
 * (cartes au centre), et où (ville en signature bas de cadre).
 *
 * PERF : plus aucune vidéo. Chaque acte est une IMAGE FIXE zoomée/dézoomée
 * par le scroll (Ken Burns en transform CSS). Zéro décodage vidéo par frame,
 * zéro seek — c'est ce qui saturait les machines modestes et les faisait
 * chauffer. La seule boucle rAF restante est le lissage de progression
 * (useScrollProgress), qui dort dès que le scroll s'arrête.
 *
 *   Ouverture  — l'image est cadrée comme une affiche, puis s'ouvre plein écran.
 *   Acte I     — 2021-2024 · Caen (licence) : plan de la ville → insert HTML/CSS
 *                → insert maths au cahier. Coupe directe html/css → maths.
 *   Acte II    — 2024-2025 · Rennes : rue à colombages du vieux Rennes.
 *   Panneau    — « 2025 — 2027 » : masque la coupe, annonce l'ère du master.
 *   Acte III   — 2025-2027 · Rennes : place Sainte-Anne.
 *   Clôture    — l'image se fige et se teinte : le film redevient une affiche.
 *
 * Médias (voir CREDITS.md — certains sont en CC avec attribution obligatoire) :
 *   Caen : photo Florian Pépellin, Wikimedia Commons, CC BY-SA 4.0.
 *   Place Sainte-Anne : photo TouN, Wikimedia Commons, CC BY-SA 3.0.
 *   Les inserts html/css, maths et la rue de Rennes sont des images extraites.
 */

const ACTS: { id: number; from: number; to: number; photo: string; kb: 'in' | 'out'; pos?: string }[] = [
  // Acte I monté façon documentaire : plan de Caen → insert « premières lignes
  // de HTML » → insert « maths au cahier ». Coupes franches, le grading unifie.
  { id: 1, from: 0.1, to: 0.21, photo: '/images/journey-caen.jpg', kb: 'in' }, // Caen — plan de ville
  { id: 6, from: 0.21, to: 0.31, photo: '/images/journey-act6-poster.jpg', kb: 'in', pos: 'center 50%' }, // insert HTML/CSS
  { id: 7, from: 0.31, to: 0.44, photo: '/images/journey-act7-poster.jpg', kb: 'out', pos: 'center 50%' }, // insert maths
  { id: 3, from: 0.44, to: 0.66, photo: '/images/journey-act3-poster.jpg', kb: 'in', pos: 'center 45%' }, // Rennes — colombages
  { id: 4, from: 0.685, to: 0.93, photo: '/images/journey-rennes2.jpg', kb: 'out' }, // place Sainte-Anne
];
// Trame lisible année par année :
//   - un bandeau d'ÈRE (les années) chapeaute chaque acte en haut de l'écran ;
//   - les cartes (ce que j'y ai fait) occupent le centre ;
//   - la ville signe le bas de cadre.
// Le panneau opaque — qui masque la coupe colombages→Sainte-Anne — annonce
// l'ère qu'il ouvre.
const ERAS = [
  { label: '2021 — 2024', from: 0.105, to: 0.435 },
  { label: '2024 — 2025', from: 0.445, to: 0.655 },
  { label: '2025 — 2027', from: 0.715, to: 0.93 },
];
const INTERTITLES: { label: string; from: number; to: number; panel: boolean; caption: boolean }[] = [
  // Acte I : la signature suit les plans — la ville sur le plan large, la
  // matière étudiée sur les inserts (le plan porte l'info, le texte la nomme).
  { label: 'Caen', from: 0.105, to: 0.205, panel: false, caption: true },
  { label: 'HTML / CSS', from: 0.215, to: 0.305, panel: false, caption: true },
  { label: 'Mathématiques', from: 0.315, to: 0.435, panel: false, caption: true },
  { label: 'Rennes', from: 0.445, to: 0.655, panel: false, caption: true },
  { label: '2025 — 2027', from: 0.66, to: 0.71, panel: true, caption: false },
  { label: 'Rennes', from: 0.715, to: 0.925, panel: false, caption: true },
];
// Fenêtres d'affichage des 5 étapes (indexées comme STOPS).
// Chaque année scolaire vécue en parallèle (école + alternance) forme une PAIRE
// affichée simultanément — école à gauche, alternance à droite.
//   2021-2024 · Caen   : licence, carte seule.
//   2024-2025 · Rennes : bachelor (02) + Cap Achat (03), pendant l'acte colombages.
//   2025-2027 · panneau « 2025 » : Epitech (04) + Spayr (05), jusqu'à la clôture.
const STEP_WINDOWS: { from: number; to: number; side: 'left' | 'right'; paired: boolean }[] = [
  // La carte 01 s'installe sur le plan de Caen et reste affichée par-dessus les
  // inserts html/css et maths (elle contextualise le montage de l'acte I).
  { from: 0.135, to: 0.44, side: 'left', paired: false },
  { from: 0.49, to: 0.655, side: 'left', paired: true },
  { from: 0.525, to: 0.655, side: 'right', paired: true },
  { from: 0.735, to: 1.02, side: 'left', paired: true },
  { from: 0.77, to: 1.02, side: 'right', paired: true },
];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function mapRange(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}
function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// L'acte actif est le dernier dont la fenêtre a commencé — les `from` des
// ACTS définissent donc directement les points de coupe du montage.
function activeAct(p: number) {
  for (let i = ACTS.length - 1; i >= 0; i--) if (p >= ACTS[i].from) return i;
  return 0;
}
function stepOpacity(i: number, p: number) {
  const { from, to } = STEP_WINDOWS[i];
  return Math.min(mapRange(p, from, from + 0.035), 1 - mapRange(p, to - 0.03, to));
}

export default function JourneyFilm() {
  const ref = useRef<HTMLElement | null>(null);
  // Progression lissée (τ = 0,14 s) : tout ce qui est piloté par le scroll
  // — Ken Burns, cartes, intertitres, cadre — glisse au lieu de sauter de cran
  // en cran de molette. La boucle de lissage dort dès que le scroll s'arrête.
  // reduced-motion : progression brute (0), aucune boucle continue.
  const [reduce] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const p = useScrollProgress(ref, reduce ? 0 : 0.14);
  const [nearby, setNearby] = useState(false);

  // Ne charge les images qu'à l'approche de la section (2 écrans avant), pour ne
  // pas peser sur le chargement initial de la page.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearby(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200% 0px 200% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Aimants de scroll : quand le défilement s'arrête à proximité d'une carte
  // (l'information principale — Université, Epitech…), la vue glisse doucement
  // pour se poser dessus, carte pleinement visible.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Points d'ancrage en progression : carte 01 (sur le plan de Caen, avant la
    // première coupe), paire bachelor+cap, paire epitech+spayr. Rayon réduit
    // pour la carte 01 : sa zone d'attraction ne doit pas mordre sur l'insert
    // HTML/CSS qui commence à 0.21 (on doit pouvoir s'y arrêter).
    const ANCHORS = [
      { p: 0.155, r: 0.028 },
      { p: 0.565, r: 0.055 },
      { p: 0.82, r: 0.055 },
    ];
    let timer = 0;
    let anim = 0;
    let animating = false;
    let lastSetY = -1;
    const cancelAnim = () => {
      animating = false;
      cancelAnimationFrame(anim);
    };
    const onScroll = () => {
      if (animating) {
        // Un scroll qui ne vient pas de notre animation = reprise en main → on lâche
        if (Math.abs(window.scrollY - lastSetY) > 2) cancelAnim();
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) return;
        const pNow = -rect.top / total;
        if (pNow < 0 || pNow > 1) return;
        const target = ANCHORS.find((a) => Math.abs(pNow - a.p) < a.r)?.p;
        if (target == null || Math.abs(pNow - target) < 0.003) return;
        const startY = window.scrollY;
        const destY = startY + (target - pNow) * total;
        const t0 = performance.now();
        const D = 650; // ms
        animating = true;
        const step = (now: number) => {
          if (!animating) return;
          const t = Math.min(1, (now - t0) / D);
          lastSetY = Math.round(startY + (destY - startY) * (1 - Math.pow(1 - t, 3)));
          window.scrollTo(0, lastSetY);
          if (t < 1) anim = requestAnimationFrame(step);
          else animating = false;
        };
        anim = requestAnimationFrame(step);
      }, 220);
    };
    // Toute reprise en main de l'utilisateur interrompt l'aimant
    window.addEventListener('wheel', cancelAnim, { passive: true });
    window.addEventListener('touchstart', cancelAnim, { passive: true });
    window.addEventListener('keydown', cancelAnim);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', cancelAnim);
      window.removeEventListener('touchstart', cancelAnim);
      window.removeEventListener('keydown', cancelAnim);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
      cancelAnim();
    };
  }, []);

  const act = activeAct(p);
  const open = ease(mapRange(p, 0.02, 0.1));
  const titleOut = mapRange(p, 0.05, 0.1);
  const closing = mapRange(p, 0.93, 1);

  return (
    <section
      ref={ref}
      id="journey"
      style={{ position: 'relative', height: '520vh', background: TOK.bgDeep, color: TOK.cream }}
    >
      {/* 100dvh (et pas 100vh) : sur mobile le cadre épouse la hauteur RÉELLEMENT
          visible, sous la barre du navigateur — sinon les signatures bas de
          cadre passaient sous la barre. */}
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100dvh', overflow: 'hidden' }}>
        {/* CADRE IMAGE — commence en affiche, s'ouvre plein écran */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${0.55 + open * 0.45})`,
            border: `1px solid rgba(240, 231, 212, ${(1 - open) * 0.35})`,
            boxShadow: open < 1 ? '0 30px 80px rgba(15, 12, 8, 0.5)' : 'none',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {ACTS.map((a, i) => {
            const pLocal = mapRange(p, a.from, a.to);
            // Ken Burns piloté par le scroll : zoom avant ('in') ou arrière
            // ('out'), avec une légère dérive verticale. Pure transform CSS,
            // aucun décodage — c'est l'effet « zoom/dézoom » qui remplace la vidéo.
            const z = a.kb === 'out' ? 1 - pLocal : pLocal;
            return (
              <img
                key={a.id}
                src={nearby ? a.photo : undefined}
                alt=""
                aria-hidden
                draggable={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: a.pos ?? 'center 28%',
                  opacity: act === i ? 1 : 0,
                  transform: `scale(${1.08 + z * 0.16}) translateY(${(0.5 - z) * 2.4}%)`,
                  transition: 'opacity 0.25s ease',
                  willChange: act === i ? 'transform' : 'auto',
                }}
              />
            );
          })}

          {/* Vignette de lisibilité */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(24,19,13,0.55) 0%, transparent 28%, transparent 48%, rgba(24,19,13,0.72) 100%)',
              pointerEvents: 'none',
            }}
          />
          {/* Grain — sans blend (perf) ; le grading ci-dessous garde son multiply
              car il est essentiel (teinte les médias vers la palette) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: TEXTURES.grain,
              opacity: 0.4 + closing * 0.25,
              pointerEvents: 'none',
            }}
          />
          {/* Grading litho — teinte chaude permanente qui unifie les plans vers
              la palette, et monte en clôture (l'image redevient affiche) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #D8C09A 0%, #C7AE86 50%, #33291f 100%)',
              mixBlendMode: 'multiply',
              opacity: 0.55 + closing * 0.35,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* KICKER au-dessus du cadre réduit (ouverture) */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(72px, 11vh, 120px)',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: TOK.sun,
            opacity: 1 - open,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          Chapitre IV · Parcours
        </div>

        {/* TITRE d'ouverture — déborde du cadre */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 20,
            opacity: 1 - titleOut,
            transform: `translateY(${titleOut * -36}px)`,
          }}
        >
          <h2
            style={{
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: 'clamp(56px, 10vw, 170px)',
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
              color: TOK.cream,
              margin: 0,
              textTransform: 'uppercase',
              textAlign: 'center',
              textShadow: '0 4px 40px rgba(15, 12, 8, 0.55)',
            }}
          >
            Mon parcours<span style={{ color: TOK.sun }}>.</span>
          </h2>
        </div>

        {/* TOP BAR — visible après l'ouverture */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'clamp(72px, 10vh, 104px) clamp(32px, 5vw, 80px) 0',
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            opacity: open * (p > 0.05 ? 1 : 0),
            zIndex: 30,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              color: TOK.sun,
              textShadow: '0 1px 10px rgba(26,18,9,0.55)',
            }}
          >
            <span style={{ width: 28, height: 1, background: TOK.sun }} />
            <span>Chapitre IV</span>
            <span style={{ opacity: 0.75 }}>· Parcours</span>
          </span>
        </div>

        {/* ÉTAPES — le cœur de la section : cartes centrées verticalement,
            typographie généreuse. La ville n'est qu'une signature en bas. */}
        {STOPS.map((stop, i) => {
          const op = stepOpacity(i, p);
          if (op <= 0) return null;
          const win = STEP_WINDOWS[i];
          const drift = mapRange(p, win.from, Math.min(win.to, 1));
          const left = win.side === 'left';
          return (
            <div
              key={stop.id}
              style={{
                position: 'absolute',
                [left ? 'left' : 'right']: 'clamp(32px, 6vw, 110px)',
                // Paires école/alternance : on aligne leur BORD HAUT sur une même
                // ligne (ancre fixe) au lieu de centrer chacune sur sa propre
                // hauteur — sinon deux cartes de hauteurs différentes ne
                // commencent pas au même niveau. La carte seule reste centrée.
                top: win.paired ? 'calc(50% - 150px)' : '50%',
                maxWidth: win.paired ? 'min(520px, 42vw)' : 'min(680px, 78vw)',
                opacity: op,
                transform: win.paired
                  ? `translateY(${(1 - op) * 20 + (0.5 - drift) * 26}px)`
                  : `translateY(calc(-50% + ${(1 - op) * 20 + (0.5 - drift) * 26}px))`,
                pointerEvents: 'none',
                zIndex: 5,
                // Carte de gauche alignée à gauche, carte de droite alignée à
                // droite : chaque carte « pend » de son bord d'écran.
                textAlign: left ? 'left' : 'right',
              }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 11,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: TOK.sun,
                    marginBottom: 12,
                    textShadow: '0 1px 8px rgba(26,18,9,0.65)',
                  }}
                >
                  {stop.type === 'edu' ? 'École' : 'Alternance'} · {stop.city}
                </div>
                <div
                  style={{
                    fontFamily: FONT.display,
                    fontWeight: 800,
                    fontSize: win.paired ? 'clamp(38px, 4.6vw, 78px)' : 'clamp(46px, 6.4vw, 110px)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    color: TOK.cream,
                    textShadow: '0 2px 26px rgba(24,19,13,0.55)',
                  }}
                >
                  {stop.title}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: FONT.serif,
                    fontStyle: 'italic',
                    fontSize: 'clamp(18px, 1.6vw, 22px)',
                    color: TOK.cream,
                    opacity: 0.9,
                    textShadow: '0 1px 12px rgba(24,19,13,0.65)',
                  }}
                >
                  {stop.org}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: FONT.serif,
                    fontSize: 'clamp(16px, 1.3vw, 18px)',
                    color: 'rgba(240,231,212,0.78)',
                    textShadow: '0 1px 10px rgba(24,19,13,0.6)',
                  }}
                >
                  {stop.desc}
                </div>
              </div>
            </div>
          );
        })}

        {/* ÈRE — les années de l'acte courant, en haut au centre : le repère
            temporel permanent qui répond à « qu'est-ce que je faisais là ? » */}
        {ERAS.map((era) => {
          const op = Math.min(mapRange(p, era.from, era.from + 0.03), 1 - mapRange(p, era.to - 0.03, era.to));
          if (op <= 0) return null;
          return (
            <div
              key={era.from}
              style={{
                position: 'absolute',
                top: 'clamp(112px, 15vh, 170px)',
                left: 0,
                right: 0,
                textAlign: 'center',
                opacity: op,
                transform: `translateY(${(1 - op) * -14}px)`,
                zIndex: 8,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 'clamp(30px, 3.4vw, 54px)',
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  color: TOK.cream,
                  textShadow: '0 2px 30px rgba(24,19,13,0.65)',
                }}
              >
                {era.label}
              </div>
            </div>
          );
        })}

        {/* INTERTITRES — villes en signature de lieu discrète (bas de cadre) et
            panneau opaque annonçant l'ère */}
        {INTERTITLES.map((it) => {
          const fade = it.panel ? 0.02 : 0.03;
          const op = Math.min(mapRange(p, it.from, it.from + fade), 1 - mapRange(p, it.to - fade, it.to));
          if (op <= 0) return null;
          if (it.caption) {
            return (
              <div
                key={`${it.label}-${it.from}`}
                style={{
                  position: 'absolute',
                  left: 'clamp(32px, 6vw, 110px)',
                  bottom: 'clamp(56px, 9vh, 110px)',
                  opacity: op,
                  transform: `translateY(${(1 - op) * 14}px)`,
                  zIndex: 8,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                }}
              >
                <span style={{ width: 28, height: 1, background: TOK.sun, alignSelf: 'center' }} />
                <span
                  style={{
                    fontFamily: FONT.display,
                    fontWeight: 800,
                    fontSize: 'clamp(26px, 2.6vw, 42px)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    color: TOK.cream,
                    textShadow: '0 2px 26px rgba(24,19,13,0.6)',
                  }}
                >
                  {it.label}
                  <span style={{ color: TOK.sun }}>.</span>
                </span>
              </div>
            );
          }
          return (
            <div
              key={`${it.label}-${it.from}`}
              style={{
                position: 'absolute',
                inset: 0,
                background: it.panel ? TOK.bgDeep : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: op,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  // Le panneau porte un intervalle d'années (long) : corps réduit
                  fontSize: it.panel ? 'clamp(56px, 9.5vw, 150px)' : 'clamp(88px, 17vw, 250px)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  textTransform: 'uppercase',
                  color: TOK.cream,
                  transform: `translateY(${(1 - op) * 22}px)`,
                  textShadow: it.panel ? 'none' : '0 6px 60px rgba(15, 12, 8, 0.7)',
                }}
              >
                {it.label}
                <span style={{ color: TOK.sun }}>.</span>
              </div>
            </div>
          );
        })}

        {/* RAIL DE PROGRESSION — droite */}
        <div
          style={{
            position: 'absolute',
            right: 'clamp(22px, 3vw, 46px)',
            top: '50%',
            transform: 'translateY(-50%)',
            height: 'clamp(180px, 30vh, 300px)',
            width: 2,
            background: 'rgba(240,231,212,0.22)',
            opacity: open,
            zIndex: 30,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: TOK.sun,
              transform: `scaleY(${p})`,
              transformOrigin: '50% 0',
            }}
          />
          {STEP_WINDOWS.map((w, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: -3,
                top: `${((w.from - 0.1) / 0.9) * 100}%`,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: p >= w.from ? TOK.sun : 'rgba(240,231,212,0.35)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
