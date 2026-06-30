import { useRef } from 'react';
import { STOPS } from './data';
import { useScrollProgress } from './useScrollProgress';

const SKY_TINT = '#F3B775';
const SUN = '#C53A2C';
const INK = '#1A1612';
const CREAM = '#F8F1E1';

const PHOTO_URL =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85';

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function mapRange(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}
function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/*
 * Trail layout — coordinates in 1600x900 viewBox aligned to the photo composition.
 * Starts bottom-center (valley), climbs, forks mid-frame, both branches end mid-upper
 * leaving the summit visible in the photo above (deliberate: "le sommet reste à venir").
 *
 * Order matches the timeline in data.ts:
 *   licence → bachelor → epitech  (école, left branch)
 *   licence → cap → spayr         (alternance, right branch)
 */
// Trail shifted to center-right so the heading (top-left) has its own breathing room.
const VALLEY = { x: 960, y: 800 };
const TRAIL_STOPS = {
  licence: { x: 940, y: 690 },
  bachelor: { x: 800, y: 590 },
  epitech: { x: 660, y: 420 },
  cap: { x: 1180, y: 580 },
  spayr: { x: 1340, y: 400 },
};
const SUMMIT = { x: 1000, y: 100 };

// Cubic Beziers — smooth, hand-traced look. Control points placed to avoid wobble.
const MAIN_TRAIL = `M ${VALLEY.x} ${VALLEY.y} C ${VALLEY.x} 760, ${TRAIL_STOPS.licence.x + 4} 720, ${TRAIL_STOPS.licence.x} ${TRAIL_STOPS.licence.y}`;
const ECOLE_BRANCH = `M ${TRAIL_STOPS.licence.x} ${TRAIL_STOPS.licence.y} C 900 660, 850 620, ${TRAIL_STOPS.bachelor.x} ${TRAIL_STOPS.bachelor.y} C 750 530, 700 470, ${TRAIL_STOPS.epitech.x} ${TRAIL_STOPS.epitech.y}`;
const ALT_BRANCH = `M ${TRAIL_STOPS.licence.x} ${TRAIL_STOPS.licence.y} C 1020 660, 1110 620, ${TRAIL_STOPS.cap.x} ${TRAIL_STOPS.cap.y} C 1240 510, 1300 450, ${TRAIL_STOPS.spayr.x} ${TRAIL_STOPS.spayr.y}`;

export default function JourneyLitho() {
  const ref = useRef<HTMLElement | null>(null);
  const p = useScrollProgress(ref);

  const introOut = mapRange(p, 0.05, 0.18);
  const photoIn = mapRange(p, 0.06, 0.26);
  const headingIn = mapRange(p, 0.20, 0.42);
  const mainDraw = ease(mapRange(p, 0.36, 0.52));
  const branchesDraw = ease(mapRange(p, 0.50, 0.78));
  const stationReveal = (order: number) => mapRange(p, 0.56 + order * 0.04, 0.66 + order * 0.04);

  return (
    <section
      ref={ref}
      id="journey"
      className="journey-litho relative"
      style={{ height: '360vh', background: '#1A1209', color: INK }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* PHOTO BACKGROUND */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${PHOTO_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            opacity: 0.55 + photoIn * 0.45,
            transition: 'opacity 0.1s linear',
          }}
        />
        {/* Peach color treatment — multiply to push into PLM palette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${SKY_TINT} 0%, ${SKY_TINT}cc 45%, #8c5a32cc 100%)`,
            mixBlendMode: 'multiply',
          }}
        />
        {/* Warm screen layer — lift highlights into sunset tone */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(255,180,100,0.18) 0%, transparent 60%)`,
            mixBlendMode: 'screen',
          }}
        />
        {/* Litho grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0 2px, rgba(26,22,18,0.05) 2px 3px), repeating-linear-gradient(90deg, transparent 0 2px, rgba(26,22,18,0.03) 2px 3px)',
            mixBlendMode: 'multiply',
            opacity: 0.7,
          }}
        />
        {/* Vignette for text legibility (top + bottom darker) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(26,18,9,0.45) 0%, transparent 25%, transparent 60%, rgba(26,18,9,0.55) 100%)',
          }}
        />

        {/* TOP BAR */}
        <div
          className="absolute top-0 left-0 right-0 flex justify-between items-center z-10"
          style={{
            padding: 'clamp(28px, 4vh, 48px) clamp(32px, 5vw, 80px)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: CREAM,
          }}
        >
          <span className="inline-flex items-center gap-3">
            <span style={{ width: 28, height: 1, background: CREAM }} />
            <span>Chapitre IV</span>
            <span style={{ opacity: 0.6 }}>· Parcours</span>
          </span>
          <span style={{ letterSpacing: '0.4em', opacity: 0.85 }}>P · L · M &nbsp;·&nbsp; MMXXVI</span>
        </div>

        {/* HEADING — large affiche-style overlay, top-left */}
        <div
          className="absolute pointer-events-none z-[5]"
          style={{
            top: 'clamp(110px, 16vh, 180px)',
            left: 'clamp(32px, 5vw, 90px)',
            maxWidth: 'min(520px, 38vw)',
            opacity: headingIn,
            transform: `translateY(${(1 - headingIn) * 24}px)`,
            transition: 'opacity 0.1s linear, transform 0.1s linear',
          }}
        >
          <h2
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(44px, 6.6vw, 108px)',
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
              color: CREAM,
              margin: 0,
              textTransform: 'uppercase',
              textShadow: '0 2px 24px rgba(26,18,9,0.45)',
            }}
          >
            Cinq ans,
            <br />
            deux voies
            <br />
            <span style={{ color: SUN }}>parallèles.</span>
          </h2>
          <div
            style={{
              marginTop: 24,
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(17px, 1.5vw, 22px)',
              color: CREAM,
              opacity: 0.85,
              maxWidth: '24ch',
              lineHeight: 1.35,
              textShadow: '0 1px 12px rgba(26,18,9,0.5)',
            }}
          >
            L'école d'un côté, l'alternance de l'autre — qui montent ensemble.
          </div>
        </div>

        {/* TRAIL OVERLAY — drawn ON the photo */}
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3 }}
        >
          <defs>
            {/* Subtle dark outline shadow so the trail reads on any photo region */}
            <filter id="trail-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1A1209" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* Valley marker — départ */}
          <g style={{ opacity: photoIn }}>
            <circle cx={VALLEY.x} cy={VALLEY.y} r="5" fill={CREAM} />
            <text
              x={VALLEY.x}
              y={VALLEY.y + 30}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              letterSpacing="0.22em"
              fill={CREAM}
              fillOpacity="0.7"
            >
              Avant 2021
            </text>
          </g>

          {/* Trails — DrawnPath embeds its own shadow + glow layers */}
          <DrawnPath d={MAIN_TRAIL} progress={mainDraw} color={CREAM} width={3.2} />
          <DrawnPath d={ECOLE_BRANCH} progress={branchesDraw} color={CREAM} width={2.8} />
          <DrawnPath d={ALT_BRANCH} progress={branchesDraw} color={SUN} width={3.2} />

          {/* Continuation dots — three fading dots from each in-progress branch end toward summit */}
          <ContinuationDots
            from={TRAIL_STOPS.epitech}
            toward={SUMMIT}
            color={CREAM}
            progress={mapRange(p, 0.78, 0.88)}
          />
          <ContinuationDots
            from={TRAIL_STOPS.spayr}
            toward={SUMMIT}
            color={SUN}
            progress={mapRange(p, 0.78, 0.88)}
          />

          {/* Stops */}
          <Stop
            stopId="licence"
            x={TRAIL_STOPS.licence.x}
            y={TRAIL_STOPS.licence.y}
            anchor="right"
            color={CREAM}
            op={stationReveal(0)}
          />
          <Stop
            stopId="bachelor"
            x={TRAIL_STOPS.bachelor.x}
            y={TRAIL_STOPS.bachelor.y}
            anchor="left"
            color={CREAM}
            op={stationReveal(1)}
          />
          <Stop
            stopId="cap"
            x={TRAIL_STOPS.cap.x}
            y={TRAIL_STOPS.cap.y}
            anchor="right"
            color={SUN}
            op={stationReveal(2)}
          />
          <Stop
            stopId="epitech"
            x={TRAIL_STOPS.epitech.x}
            y={TRAIL_STOPS.epitech.y}
            anchor="left"
            color={CREAM}
            op={stationReveal(3)}
          />
          <Stop
            stopId="spayr"
            x={TRAIL_STOPS.spayr.x}
            y={TRAIL_STOPS.spayr.y}
            anchor="right"
            color={SUN}
            op={stationReveal(4)}
          />

          {/* Summit marker — visible target, never reached */}
          <g style={{ opacity: branchesDraw * 0.7 }}>
            <polygon
              points={`${SUMMIT.x},${SUMMIT.y - 10} ${SUMMIT.x - 6},${SUMMIT.y + 5} ${SUMMIT.x + 6},${SUMMIT.y + 5}`}
              fill={CREAM}
            />
            <text
              x={SUMMIT.x}
              y={SUMMIT.y - 22}
              textAnchor="middle"
              fontFamily="Instrument Serif, serif"
              fontStyle="italic"
              fontSize="20"
              fill={CREAM}
            >
              Mont-Blanc · 4 810 m
            </text>
            <text
              x={SUMMIT.x}
              y={SUMMIT.y + 20}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              letterSpacing="0.32em"
              fill={CREAM}
              fillOpacity="0.65"
            >
              · à venir ·
            </text>
          </g>
        </svg>

        {/* BOTTOM LEGEND — compact, integrated */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex justify-between items-end"
          style={{
            padding: 'clamp(20px, 3vh, 36px) clamp(32px, 5vw, 80px)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: CREAM,
            opacity: branchesDraw,
          }}
        >
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2.5">
              <span style={{ width: 18, height: 2, background: CREAM }} />
              <span>Voie · École</span>
            </span>
            <span className="flex items-center gap-2.5">
              <span style={{ width: 18, height: 2, background: SUN }} />
              <span style={{ color: SUN }}>Voie · Alternance</span>
            </span>
          </div>
          <div style={{ opacity: 0.7 }}>5 paliers · 2021 → 2026 · ascension en cours</div>
        </div>

        {/* INTRO */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          style={{
            background: `linear-gradient(180deg, ${SKY_TINT} 0%, ${SKY_TINT}f0 60%, ${SKY_TINT}00 100%)`,
            opacity: 1 - introOut,
            transition: 'opacity 0.12s linear',
          }}
        >
          <div style={{ maxWidth: 820, padding: '0 5vw', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(56px, 9vw, 140px)',
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
                color: INK,
                margin: 0,
                textTransform: 'uppercase',
              }}
            >
              Mon <span style={{ color: SUN }}>parcours.</span>
            </h2>
            <div
              style={{
                marginTop: 32,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(26,22,18,0.6)',
              }}
            >
              ↓ continuez — la voie se trace
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function Stop({
  stopId,
  x,
  y,
  anchor,
  color,
  op,
}: {
  stopId: string;
  x: number;
  y: number;
  anchor: 'left' | 'right';
  color: string;
  op: number;
}) {
  const stop = STOPS.find((s) => s.id === stopId);
  if (!stop) return null;
  const labelDx = anchor === 'left' ? -14 : 14;
  const textAnchor = anchor === 'left' ? 'end' : 'start';
  return (
    <g style={{ opacity: op, transform: `translateY(${(1 - op) * 8}px)` }}>
      {/* Solid filled dot — no outline ring, cleaner */}
      <circle cx={x} cy={y} r="5" fill={color} filter="url(#trail-shadow)" />
      {stop.ongoing && (
        <circle cx={x} cy={y} r="5" fill="none" stroke={color} strokeWidth="1.5">
          <animate attributeName="r" values="5;14;5" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      <text
        x={x + labelDx}
        y={y - 4}
        textAnchor={textAnchor}
        fontFamily="Instrument Serif, serif"
        fontStyle="italic"
        fontSize="22"
        fill={CREAM}
        style={{ paintOrder: 'stroke', stroke: 'rgba(26,18,9,0.6)', strokeWidth: 3, strokeLinejoin: 'round' }}
      >
        {stop.title}
      </text>
      <text
        x={x + labelDx}
        y={y + 16}
        textAnchor={textAnchor}
        fontFamily="JetBrains Mono, monospace"
        fontSize="10"
        letterSpacing="0.28em"
        fill={CREAM}
        fillOpacity="0.78"
        style={{ paintOrder: 'stroke', stroke: 'rgba(26,18,9,0.55)', strokeWidth: 2.5, strokeLinejoin: 'round' }}
      >
        {stop.year.replace(/\s—\s/, '—')} · {STOP_ROLE[stopId]}
      </text>
    </g>
  );
}

const STOP_ROLE: Record<string, string> = {
  licence: 'Licence',
  bachelor: 'Bachelor',
  cap: 'Alternance',
  epitech: 'Master MSc',
  spayr: 'Alternance',
};

function DrawnPath({
  d,
  progress,
  color,
  width,
}: {
  d: string;
  progress: number;
  color: string;
  width: number;
}) {
  const ref = useRef<SVGPathElement | null>(null);
  const len = ref.current?.getTotalLength?.() ?? 1200;
  const offset = len * (1 - progress);
  return (
    <>
      {/* Dark shadow under the stroke — explicit pair beats a blur filter for crispness */}
      <path
        d={d}
        fill="none"
        stroke="#0E0905"
        strokeOpacity={0.55}
        strokeWidth={width + 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={offset}
      />
      {/* Subtle outer glow for color presence on photo */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity={0.25}
        strokeWidth={width + 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={offset}
        style={{ filter: 'blur(3px)' }}
      />
      {/* Top colored stroke */}
      <path
        ref={ref}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={offset}
      />
    </>
  );
}

/**
 * Three small fading dots from a branch endpoint pointing toward the summit.
 * Visual cue for "the path continues" without committing to a full path.
 */
function ContinuationDots({
  from,
  toward,
  color,
  progress,
}: {
  from: { x: number; y: number };
  toward: { x: number; y: number };
  color: string;
  progress: number;
}) {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const dist = Math.hypot(dx, dy);
  const ux = dx / dist;
  const uy = dy / dist;
  const steps = [
    { off: 30, r: 3, op: 0.85 },
    { off: 58, r: 2.4, op: 0.55 },
    { off: 84, r: 1.8, op: 0.3 },
  ];
  return (
    <g style={{ opacity: progress }}>
      {steps.map((s, i) => (
        <circle
          key={i}
          cx={from.x + ux * s.off}
          cy={from.y + uy * s.off}
          r={s.r}
          fill={color}
          opacity={s.op}
        />
      ))}
    </g>
  );
}
