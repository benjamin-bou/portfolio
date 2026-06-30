import { useRef } from 'react';
import { STOPS, SUMMIT_ALT, VALLEY_ALT } from './data';
import { useScrollProgress } from './useScrollProgress';

const BG = '#0A0908';
const PANEL = '#16120E';
const GRID = '#2A2520';
const ORANGE = '#FF6A1F';
const ORANGE_HOT = '#FFB057';
const BLUE = '#7DD3FC';
const TEXT = '#E8E4DE';
const MUTED = 'rgba(232,228,222,0.5)';

const CHART = { x0: 80, x1: 1340, y0: 60, y1: 380, yMax: 5200 };
const YEAR_MIN = 2021;
const YEAR_MAX = 2026.2;

const xOf = (year: number) =>
  CHART.x0 + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (CHART.x1 - CHART.x0);
const yOf = (alt: number) =>
  CHART.y1 - (alt / CHART.yMax) * (CHART.y1 - CHART.y0);

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function mapRange(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}
function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function JourneyCockpit() {
  const ref = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const p = useScrollProgress(ref);

  const introOut = mapRange(p, 0.04, 0.16);
  const chartDraw = mapRange(p, 0.10, 0.45);
  const statsIn = mapRange(p, 0.50, 0.78);
  const outroIn = mapRange(p, 0.88, 0.99);

  // Stops light up as chart progresses
  const points = [
    { x: xOf(YEAR_MIN), y: yOf(VALLEY_ALT), alt: VALLEY_ALT, year: 2021, label: 'Vallée', virtual: true },
    ...STOPS.map((s) => ({
      x: xOf(s.yearStart),
      y: yOf(s.altitude),
      alt: s.altitude,
      year: s.yearStart,
      label: s.title,
      type: s.type,
      ongoing: s.ongoing,
      virtual: false,
    })),
  ];

  const pathD = points
    .map((pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `L ${pt.x} ${pt.y}`))
    .join(' ');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${CHART.y1} L ${points[0].x} ${CHART.y1} Z`;

  // SVG dash math
  const totalLen = pathRef.current?.getTotalLength?.() ?? 1800;
  const drawOffset = totalLen * (1 - ease(chartDraw));

  // Counter targets
  const gain = 3050 - VALLEY_ALT;
  const positionPct = Math.round((3050 / SUMMIT_ALT) * 100);

  const counterT = ease(statsIn);
  const c = (target: number) => Math.round(target * counterT);

  return (
    <section
      ref={ref}
      id="journey"
      className="journey-cockpit relative"
      style={{ height: '340vh', background: BG, color: TEXT, fontFamily: 'JetBrains Mono, monospace' }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* CRT scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.012) 2px 3px)',
          }}
        />
        {/* Edge vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 65% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        <div
          className="absolute inset-0 flex flex-col"
          style={{ padding: 'clamp(28px, 4vh, 48px) clamp(32px, 4vw, 64px)' }}
        >
          {/* TOP BAR */}
          <div className="flex justify-between items-start" style={{ marginBottom: 28 }}>
            <div className="flex items-center gap-3" style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase' }}>
              <span style={{ width: 28, height: 1, background: ORANGE }} />
              <span style={{ color: ORANGE }}>Chapitre IV</span>
              <span style={{ color: MUTED }}>· Ascension · télémétrie</span>
            </div>
            <div className="flex items-center gap-6" style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
              <span style={{ color: MUTED }}>Massif Mt-Blanc</span>
              <span style={{ color: MUTED }}>·</span>
              <span style={{ color: MUTED }}>Profil B. Boutrois</span>
              <span style={{ color: MUTED }}>·</span>
              <span className="flex items-center gap-2" style={{ color: '#FF3A1F' }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#FF3A1F',
                    animation: 'rec-blink 1.2s ease-in-out infinite',
                  }}
                />
                REC
              </span>
            </div>
          </div>

          {/* METRICS ROW */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr) 200px',
              gap: 12,
              marginBottom: 36,
              opacity: 0.4 + statsIn * 0.6,
            }}
          >
            <Metric label="D+ cumulé" value={`${c(gain).toLocaleString('fr-FR')} m`} accent />
            <Metric label="Durée" value={statsIn > 0.5 ? '5 a · 2 m' : '0 a · 0 m'} />
            <Metric label="Paliers" value={`${Math.min(5, Math.ceil(counterT * 5))} / 6`} />
            <Metric label="Position" value={`${c(positionPct)} %`} accent />
            <Metric label="Statut" value="EN COURS" pulse />
          </div>

          {/* MAIN CHART */}
          <div className="flex-1 flex" style={{ gap: 24 }}>
            <div
              className="flex-1 relative"
              style={{
                background: PANEL,
                border: `1px solid ${GRID}`,
              }}
            >
              {/* Chart frame */}
              <div
                className="absolute"
                style={{
                  top: 12,
                  left: 16,
                  right: 16,
                  fontSize: 10,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: MUTED,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Profil d'altitude · 5 ans</span>
                <span>m AGL</span>
              </div>

              <svg
                viewBox="0 0 1400 420"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                {/* Grid lines */}
                {[0, 1000, 2000, 3000, 4000, 5000].map((alt) => (
                  <g key={alt}>
                    <line
                      x1={CHART.x0}
                      x2={CHART.x1}
                      y1={yOf(alt)}
                      y2={yOf(alt)}
                      stroke={GRID}
                      strokeWidth={alt % 2000 === 0 ? 0.8 : 0.4}
                    />
                    <text
                      x={CHART.x0 - 8}
                      y={yOf(alt) + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill={MUTED}
                      fontFamily="JetBrains Mono, monospace"
                      letterSpacing="0.1em"
                    >
                      {alt}
                    </text>
                  </g>
                ))}

                {/* Year ticks */}
                {[2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                  <g key={yr}>
                    <line
                      x1={xOf(yr)}
                      x2={xOf(yr)}
                      y1={CHART.y0}
                      y2={CHART.y1}
                      stroke={GRID}
                      strokeWidth={0.4}
                    />
                    <text
                      x={xOf(yr)}
                      y={CHART.y1 + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fill={MUTED}
                      fontFamily="JetBrains Mono, monospace"
                      letterSpacing="0.16em"
                    >
                      {yr}
                    </text>
                  </g>
                ))}

                {/* Summit target line */}
                <g style={{ opacity: chartDraw * 0.8 }}>
                  <line
                    x1={CHART.x0}
                    x2={CHART.x1}
                    y1={yOf(SUMMIT_ALT)}
                    y2={yOf(SUMMIT_ALT)}
                    stroke={ORANGE_HOT}
                    strokeOpacity={0.4}
                    strokeWidth={0.8}
                    strokeDasharray="4 6"
                  />
                  <text
                    x={CHART.x1 - 6}
                    y={yOf(SUMMIT_ALT) - 6}
                    textAnchor="end"
                    fontSize="10"
                    fill={ORANGE_HOT}
                    fillOpacity={0.7}
                    letterSpacing="0.16em"
                  >
                    SOMMET 4810 m
                  </text>
                </g>

                {/* Area under curve */}
                <defs>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={ORANGE} stopOpacity="0.35" />
                    <stop offset="1" stopColor={ORANGE} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <clipPath id="reveal-clip">
                  <rect
                    x={CHART.x0}
                    y={CHART.y0 - 20}
                    width={(CHART.x1 - CHART.x0) * ease(chartDraw)}
                    height={CHART.y1 - CHART.y0 + 40}
                  />
                </clipPath>
                <g clipPath="url(#reveal-clip)">
                  <path d={areaD} fill="url(#area-grad)" />
                </g>

                {/* Main path */}
                <path
                  ref={pathRef}
                  d={pathD}
                  fill="none"
                  stroke={ORANGE}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={totalLen}
                  strokeDashoffset={drawOffset}
                  style={{ filter: `drop-shadow(0 0 8px ${ORANGE}88)` }}
                />

                {/* Scrub line (current scroll position) */}
                <g style={{ opacity: chartDraw * 0.85 }}>
                  <line
                    x1={CHART.x0 + (CHART.x1 - CHART.x0) * ease(chartDraw)}
                    x2={CHART.x0 + (CHART.x1 - CHART.x0) * ease(chartDraw)}
                    y1={CHART.y0 - 8}
                    y2={CHART.y1 + 8}
                    stroke={ORANGE_HOT}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                  />
                </g>

                {/* Stop markers */}
                {points.map((pt, i) => {
                  if (pt.virtual || !('type' in pt)) return null;
                  const reachThr = (pt.x - CHART.x0) / (CHART.x1 - CHART.x0);
                  const reached = ease(chartDraw) > reachThr - 0.02;
                  const op = reached ? 1 : 0.15;
                  const color = pt.type === 'edu' ? BLUE : ORANGE_HOT;
                  return (
                    <g key={i} style={{ opacity: op, transition: 'opacity 0.3s' }}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={5}
                        fill={BG}
                        stroke={color}
                        strokeWidth={2}
                      />
                      {pt.ongoing && reached && (
                        <circle cx={pt.x} cy={pt.y} r={5} fill="none" stroke={color} strokeWidth={1.2}>
                          <animate attributeName="r" values="5;14;5" dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="stroke-opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <text
                        x={pt.x}
                        y={pt.y - 14}
                        textAnchor="middle"
                        fontSize="10"
                        fill={TEXT}
                        letterSpacing="0.14em"
                      >
                        {pt.label.toUpperCase()}
                      </text>
                      <text
                        x={pt.x}
                        y={pt.y + 22}
                        textAnchor="middle"
                        fontSize="9"
                        fill={color}
                        letterSpacing="0.1em"
                      >
                        {pt.alt} m
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* MINI MAP side panel */}
            <div
              style={{
                width: 280,
                background: PANEL,
                border: `1px solid ${GRID}`,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: MUTED, display: 'flex', justifyContent: 'space-between' }}>
                <span>Topographie</span>
                <span>N ↑</span>
              </div>
              <div className="relative flex-1" style={{ minHeight: 220 }}>
                <svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%' }}>
                  {[80, 65, 50, 35, 20].map((r, i) => (
                    <ellipse
                      key={r}
                      cx={120}
                      cy={120}
                      rx={r * 1.15}
                      ry={r}
                      fill="none"
                      stroke={ORANGE}
                      strokeOpacity={0.15 + i * 0.08}
                      strokeWidth={i === 4 ? 1 : 0.5}
                    />
                  ))}
                  {/* Current position */}
                  <circle cx={120 + 25} cy={120 + 18} r={4} fill={ORANGE_HOT} />
                  <circle cx={120 + 25} cy={120 + 18} r={4} fill="none" stroke={ORANGE_HOT}>
                    <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <text x={120 + 32} y={120 + 22} fontSize="9" fill={ORANGE_HOT} letterSpacing="0.12em">VOUS</text>
                  {/* Summit */}
                  <polygon points={`120,120 116,127 124,127`} fill={TEXT} />
                  <text x={120} y={108} textAnchor="middle" fontSize="9" fill={TEXT} letterSpacing="0.12em">MT-BLANC</text>
                </svg>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: MUTED, lineHeight: 1.6 }}>
                Cadence moy. — 1 palier / 11 mois.
                <br />
                Voies parallèles — école / alternance.
              </div>
            </div>
          </div>
        </div>

        {/* INTRO */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${BG} 0%, ${BG}f0 60%, ${BG}00 100%)`,
            opacity: 1 - introOut,
            transition: 'opacity 0.12s linear',
          }}
        >
          <div style={{ maxWidth: 760, padding: '0 5vw' }}>
            <div className="flex items-center gap-3" style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: ORANGE, marginBottom: 28 }}>
              <span style={{ width: 28, height: 1, background: ORANGE }} />
              Chapitre IV · Télémétrie
            </div>
            <h2
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                fontSize: 'clamp(28px, 4.6vw, 64px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: TEXT,
                marginBottom: 14,
                maxWidth: '20ch',
                textTransform: 'uppercase',
              }}
            >
              5 ans &mdash;<br />
              <span style={{ color: ORANGE_HOT }}>+ 2 015 m</span> de gagnés.<br />
              <span style={{ color: MUTED }}>1 760 m restants.</span>
            </h2>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: MUTED,
                marginTop: 32,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ width: 24, height: 1, background: MUTED }} />
              Continuez à scroller — le profil se trace
            </div>
          </div>
        </div>

        {/* OUTRO */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: `linear-gradient(0deg, ${BG} 0%, ${BG}f0 60%, ${BG}00 100%)`,
            opacity: outroIn,
            transition: 'opacity 0.12s linear',
          }}
        >
          <div style={{ maxWidth: 720, padding: '0 5vw', textAlign: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: ORANGE, marginBottom: 24 }}>
              Session 01 · Sauvegardée
            </div>
            <h2
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                fontSize: 'clamp(28px, 4vw, 52px)',
                lineHeight: 1.05,
                color: TEXT,
                marginBottom: 28,
                textTransform: 'uppercase',
              }}
            >
              Ascension <span style={{ color: ORANGE_HOT }}>en cours</span>.<br />
              Reprise prévue : <span style={{ color: ORANGE_HOT }}>2026.</span>
            </h2>
            <div className="inline-flex items-center gap-8" style={{ fontSize: 11, letterSpacing: '0.26em', textTransform: 'uppercase', color: MUTED }}>
              <span>63 % du sommet</span>
              <span style={{ width: 1, height: 14, background: MUTED }} />
              <span style={{ color: ORANGE_HOT }}>▲ 1 760 m</span>
              <span style={{ width: 1, height: 14, background: MUTED }} />
              <span>Cadence 1 / 11 mois</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rec-blink {
          0%, 60% { opacity: 1; }
          70%, 100% { opacity: 0.2; }
        }
      `}</style>
    </section>
  );
}

function Metric({
  label,
  value,
  accent,
  pulse,
}: {
  label: string;
  value: string;
  accent?: boolean;
  pulse?: boolean;
}) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${GRID}`,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: MUTED }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: accent ? ORANGE_HOT : TEXT,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {pulse && (
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: ORANGE_HOT,
              boxShadow: `0 0 10px ${ORANGE_HOT}`,
              animation: 'rec-blink 1.5s ease-in-out infinite',
            }}
          />
        )}
        {value}
      </div>
    </div>
  );
}
