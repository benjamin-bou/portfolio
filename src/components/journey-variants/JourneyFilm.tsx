import { useCallback, useEffect, useRef, useState } from 'react';
import { STOPS } from './data';
import { useScrollDriver } from './useScrollProgress';
import { TOK, FONT, TEXTURES } from '../litho/tokens';

/**
 * Parcours — film en actes piloté par le scroll, lisible année par année :
 * chaque acte = une ère (les années en bandeau haut), ce que j'y ai fait
 * (cartes au centre), et où (ville en signature bas de cadre).
 *
 * PERF : plus aucune vidéo (chaque acte est une image fixe en Ken Burns CSS),
 * et surtout AUCUN re-render React pendant le scroll. Le composant se rend UNE
 * fois ; ensuite la boucle de lissage (useScrollDriver) écrit directement
 * transform/opacity sur des refs DOM. Tous les éléments pilotés restent
 * montés (visibility:hidden hors fenêtre) : zéro mount/unmount en plein
 * scroll, donc zéro invalidation de layout — seules des propriétés
 * composited (transform/opacity) bougent.
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
// Signatures de lieu/matière discrètes en bas de cadre (toutes des captions).
// Acte I : la ville sur le plan large, la matière étudiée sur les inserts (le
// plan porte l'info, le texte la nomme).
const INTERTITLES: { label: string; from: number; to: number }[] = [
  { label: 'Caen', from: 0.105, to: 0.205 },
  { label: 'HTML / CSS', from: 0.215, to: 0.305 },
  { label: 'Mathématiques', from: 0.315, to: 0.435 },
  { label: 'Rennes', from: 0.445, to: 0.655 },
  { label: 'Rennes', from: 0.715, to: 0.925 },
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
  // reduced-motion : progression brute (0), aucune boucle continue.
  const [reduce] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  // Refs vers tout ce que le scroll pilote — écrits directement chaque frame,
  // sans passer par React (voir note PERF en tête de fichier).
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const grainRef = useRef<HTMLDivElement | null>(null);
  const kickerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const topbarRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const eraRefs = useRef<(HTMLDivElement | null)[]>([]);
  const interRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  // Mémoire des dernières valeurs d'ouverture/clôture : le cadre et les calques
  // de grain/grade ne dépendent QUE d'elles. Mi-parcours elles sont constantes,
  // donc on cesse de réécrire leur transform/opacity à chaque frame — ce qui
  // invalidait la grande couche du cadre et forçait le repaint des overlays.
  const prevOpen = useRef(-1);
  const prevClosing = useRef(-1);

  // Applique l'état visuel de la progression p — uniquement des propriétés
  // composited (transform/opacity) et visibility : jamais de layout.
  const apply = useCallback((p: number) => {
    const act = activeAct(p);
    const open = ease(mapRange(p, 0.02, 0.1));
    const titleOut = mapRange(p, 0.05, 0.1);
    const closing = mapRange(p, 0.93, 1);

    // Cadre : ne réécrire QUE si l'ouverture a bougé (constante mi-parcours).
    if (open !== prevOpen.current) {
      const frame = frameRef.current;
      if (frame) {
        frame.style.transform = `scale(${0.55 + open * 0.45})`;
        frame.style.borderColor = `rgba(240, 231, 212, ${(1 - open) * 0.35})`;
        frame.style.boxShadow = open < 1 ? '0 30px 80px rgba(15, 12, 8, 0.5)' : 'none';
      }
      if (kickerRef.current) kickerRef.current.style.opacity = String(1 - open);
    }

    ACTS.forEach((a, i) => {
      const img = imgRefs.current[i];
      if (!img) return;
      const pLocal = mapRange(p, a.from, a.to);
      // Ken Burns piloté par le scroll : zoom avant ('in') ou arrière ('out'),
      // avec une légère dérive verticale. Pure transform CSS, aucun décodage.
      // translateZ(0) : force l'image sur sa PROPRE couche GPU. Sans ça, la grande
      // image plein cadre est repeinte à chaque frame de scroll (le sticky n'est
      // pas isolé), au lieu d'être simplement composité. willChange est posé une
      // fois en JSX (pas basculé ici : un toggle recrée la couche à chaque coupe).
      const z = a.kb === 'out' ? 1 - pLocal : pLocal;
      img.style.opacity = act === i ? '1' : '0';
      img.style.transform = `scale(${1.08 + z * 0.16}) translateY(${(0.5 - z) * 2.4}%) translateZ(0)`;
    });

    // Grain : opacité fonction de la clôture uniquement — constante hors clôture,
    // on ne réécrit donc que quand elle change.
    if (closing !== prevClosing.current) {
      if (grainRef.current) grainRef.current.style.opacity = String(0.4 + closing * 0.25);
    }
    prevOpen.current = open;
    prevClosing.current = closing;

    const title = titleRef.current;
    if (title) {
      title.style.opacity = String(1 - titleOut);
      title.style.transform = `translateY(${titleOut * -36}px)`;
    }
    if (topbarRef.current) topbarRef.current.style.opacity = String(open * (p > 0.05 ? 1 : 0));

    STEP_WINDOWS.forEach((win, i) => {
      const el = stepRefs.current[i];
      if (!el) return;
      const op = stepOpacity(i, p);
      if (op <= 0) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        return;
      }
      const drift = mapRange(p, win.from, Math.min(win.to, 1));
      el.style.visibility = 'visible';
      el.style.opacity = String(op);
      el.style.transform = win.paired
        ? `translateY(${(1 - op) * 20 + (0.5 - drift) * 26}px)`
        : `translateY(calc(-50% + ${(1 - op) * 20 + (0.5 - drift) * 26}px))`;
    });

    ERAS.forEach((era, i) => {
      const el = eraRefs.current[i];
      if (!el) return;
      const op = Math.min(mapRange(p, era.from, era.from + 0.03), 1 - mapRange(p, era.to - 0.03, era.to));
      if (op <= 0) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        return;
      }
      el.style.visibility = 'visible';
      el.style.opacity = String(op);
      el.style.transform = `translateY(${(1 - op) * -14}px)`;
    });

    INTERTITLES.forEach((it, i) => {
      const el = interRefs.current[i];
      if (!el) return;
      const op = Math.min(mapRange(p, it.from, it.from + 0.03), 1 - mapRange(p, it.to - 0.03, it.to));
      if (op <= 0) {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        return;
      }
      el.style.visibility = 'visible';
      el.style.opacity = String(op);
      el.style.transform = `translateY(${(1 - op) * 14}px)`;
    });

    if (railRef.current) railRef.current.style.opacity = String(open);
    if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${p})`;
    STEP_WINDOWS.forEach((w, i) => {
      const dot = dotRefs.current[i];
      if (dot) dot.style.background = p >= w.from ? TOK.sun : 'rgba(240,231,212,0.35)';
    });
  }, []);

  // Progression lissée (τ = 0,14 s) : tout ce qui est piloté par le scroll
  // — Ken Burns, cartes, intertitres, cadre — glisse au lieu de sauter de cran
  // en cran de molette. La boucle de lissage dort dès que le scroll s'arrête.
  useScrollDriver(ref, reduce ? 0 : 0.14, apply);

  // Préchargement à l'approche de la section (2 écrans avant), DÉCODÉ hors du
  // thread principal, une image à la fois.
  // Avant : les 5 `src` étaient posés d'un coup → le navigateur décodait ~52 Mo
  // de bitmaps dans la même frame → gel de ~1,4 s (le lag spike mesuré).
  // Maintenant : on décode chaque image séquentiellement via `Image.decode()`
  // (asynchrone, hors main thread) ; on ne révèle chaque `<img>` visible
  // qu'une fois son bitmap prêt en cache → le paint ne redéclenche aucun décodage
  // et le travail est étalé au lieu de tomber sur une seule frame.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const preloadSequentially = async () => {
      for (let i = 0; i < ACTS.length; i++) {
        if (cancelled) return;
        const im = new Image();
        im.decoding = 'async';
        im.src = ACTS[i].photo;
        try {
          await im.decode();
        } catch {
          /* image cassée ou interrompue : on assigne quand même, le <img> gèrera */
        }
        if (cancelled) return;
        // On pose le `src` DIRECTEMENT sur le <img> via sa ref, sans passer par
        // un state React. Un setState ici re-rendrait TOUT le composant (gros
        // arbre : images, cartes, ères, intertitres…) à chaque image décodée —
        // 5 réconciliations qui tombaient pendant le scroll vers les projets et
        // provoquaient le lag spike. Le bitmap étant déjà décodé/en cache, poser
        // le src peint depuis le cache sans re-décodage ni re-render.
        const node = imgRefs.current[i];
        if (node && !node.src) node.src = ACTS[i].photo;
      }
    };
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          void preloadSequentially();
        }
      },
      { rootMargin: '200% 0px 200% 0px' },
    );
    obs.observe(el);
    return () => {
      cancelled = true;
      obs.disconnect();
    };
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

  // Les styles inline ci-dessous décrivent l'état p = 0 (section pas encore
  // atteinte) ; useScrollDriver appelle apply() dès le montage puis à chaque
  // frame de scroll. Ils ne changent JAMAIS entre renders React (seul `nearby`
  // peut re-rendre, et il ne touche que `src`) : React ne réécrit donc pas les
  // styles posés impérativement.
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
          ref={frameRef}
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'scale(0.55)',
            border: '1px solid rgba(240, 231, 212, 0.35)',
            boxShadow: '0 30px 80px rgba(15, 12, 8, 0.5)',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {ACTS.map((a, i) => (
            <img
              key={a.id}
              ref={(n) => {
                imgRefs.current[i] = n;
              }}
              // Pas de `src` ici : il est posé via ref après décodage async
              // (voir l'effet de préchargement) pour ne provoquer aucun re-render.
              alt=""
              aria-hidden
              draggable={false}
              decoding="async"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: a.pos ?? 'center 28%',
                opacity: i === 0 ? 1 : 0,
                transform: `scale(1.08) translateZ(0)`,
                // COUPE FRANCHE (pas de transition d'opacité) : un fondu de 0.25s
                // composite DEUX images plein cadre en même temps pendant la coupe
                // → double fill-rate sur GPU intégré → lag spike à chaque coupe
                // d'acte (mesuré : 23 spikes → 8 en supprimant le fondu). La coupe
                // sèche colle d'ailleurs au montage documentaire voulu.
                // Couche GPU dédiée posée une fois : le Ken Burns devient
                // composited (pas de repaint de l'image au scroll). Voir apply().
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            />
          ))}

          {/* PLUS D'OVERLAY PLEIN CADRE (ni permanent, ni de clôture).
              PERF (clé du parcours) : sur GPU intégré (Intel HD, la cible), un
              calque plein cadre semi-transparent recomposité chaque frame coûte
              ~11-22 ms — impossible d'en avoir un ET 60 fps sur ce matériel
              (mesuré ; ni translateZ ni will-change n'y changent rien, c'est le
              FILL RATE). Le grade de clôture qu'on gardait provoquait les lag
              spikes en SORTIE de section (17 spikes → 4 en le retirant). La
              lisibilité du texte sur les photos est portée par des ombres
              renforcées, seul le grain (tuile SVG cachée, cheap) reste. */}
          {/* Grain litho — tuile SVG cachée (cheap), voir tokens.ts */}
          <div
            ref={grainRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: TEXTURES.grain,
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* KICKER au-dessus du cadre réduit (ouverture) */}
        <div
          ref={kickerRef}
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
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          Chapitre IV · Parcours
        </div>

        {/* TITRE d'ouverture — déborde du cadre */}
        <div
          ref={titleRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 20,
            opacity: 1,
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
          ref={topbarRef}
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
            opacity: 0,
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
          const win = STEP_WINDOWS[i];
          const left = win.side === 'left';
          return (
            <div
              key={stop.id}
              ref={(n) => {
                stepRefs.current[i] = n;
              }}
              style={{
                position: 'absolute',
                [left ? 'left' : 'right']: 'clamp(32px, 6vw, 110px)',
                // Paires école/alternance : on aligne leur BORD HAUT sur une même
                // ligne (ancre fixe) au lieu de centrer chacune sur sa propre
                // hauteur — sinon deux cartes de hauteurs différentes ne
                // commencent pas au même niveau. La carte seule reste centrée.
                top: win.paired ? 'calc(50% - 150px)' : '50%',
                maxWidth: win.paired ? 'min(520px, 42vw)' : 'min(680px, 78vw)',
                opacity: 0,
                visibility: 'hidden',
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
                    // Double ombre (bord net + halo) : porte la lisibilité sur
                    // les photos maintenant qu'il n'y a plus de voile plein cadre.
                    textShadow: '0 1px 3px rgba(15,12,8,0.9), 0 2px 12px rgba(15,12,8,0.7)',
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
                    textShadow: '0 2px 6px rgba(15,12,8,0.85), 0 4px 30px rgba(15,12,8,0.7)',
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
                    textShadow: '0 1px 4px rgba(15,12,8,0.9), 0 2px 14px rgba(15,12,8,0.65)',
                  }}
                >
                  {stop.org}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: FONT.serif,
                    fontSize: 'clamp(16px, 1.3vw, 18px)',
                    color: 'rgba(240,231,212,0.82)',
                    textShadow: '0 1px 4px rgba(15,12,8,0.9), 0 2px 12px rgba(15,12,8,0.65)',
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
        {ERAS.map((era, i) => (
          <div
            key={era.from}
            ref={(n) => {
              eraRefs.current[i] = n;
            }}
            style={{
              position: 'absolute',
              top: 'clamp(112px, 15vh, 170px)',
              left: 0,
              right: 0,
              textAlign: 'center',
              opacity: 0,
              visibility: 'hidden',
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
                textShadow: '0 2px 6px rgba(15,12,8,0.85), 0 3px 30px rgba(15,12,8,0.7)',
              }}
            >
              {era.label}
            </div>
          </div>
        ))}

        {/* INTERTITRES — villes/matières en signature de lieu discrète (bas de cadre) */}
        {INTERTITLES.map((it, i) => (
          <div
            key={`${it.label}-${it.from}`}
            ref={(n) => {
              interRefs.current[i] = n;
            }}
            style={{
              position: 'absolute',
              left: 'clamp(32px, 6vw, 110px)',
              bottom: 'clamp(56px, 9vh, 110px)',
              opacity: 0,
              visibility: 'hidden',
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
                textShadow: '0 2px 6px rgba(15,12,8,0.85), 0 3px 26px rgba(15,12,8,0.65)',
              }}
            >
              {it.label}
              <span style={{ color: TOK.sun }}>.</span>
            </span>
          </div>
        ))}

        {/* RAIL DE PROGRESSION — droite */}
        <div
          ref={railRef}
          style={{
            position: 'absolute',
            right: 'clamp(22px, 3vw, 46px)',
            top: '50%',
            transform: 'translateY(-50%)',
            height: 'clamp(180px, 30vh, 300px)',
            width: 2,
            background: 'rgba(240,231,212,0.22)',
            opacity: 0,
            zIndex: 30,
          }}
        >
          <div
            ref={railFillRef}
            style={{
              position: 'absolute',
              inset: 0,
              background: TOK.sun,
              transform: 'scaleY(0)',
              transformOrigin: '50% 0',
            }}
          />
          {STEP_WINDOWS.map((w, i) => (
            <span
              key={i}
              ref={(n) => {
                dotRefs.current[i] = n;
              }}
              style={{
                position: 'absolute',
                left: -3,
                top: `${((w.from - 0.1) / 0.9) * 100}%`,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'rgba(240,231,212,0.35)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
