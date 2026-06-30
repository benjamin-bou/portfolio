import { useRef } from 'react';
import { STOPS } from './data';
import { useScrollProgress } from './useScrollProgress';

const PAPER = '#F5EFE0';
const INK = '#1A1612';
const OCHRE = '#C49E3F';
const ROUGE = '#B3382A';
const VEGE = '#7A8B6B';

const SUMMIT = { x: 400, y: 100 };

const SVG_STOPS = [
  { id: 'licence', x: 380, y: 740, anchor: 'left' as const },
  { id: 'bachelor', x: 240, y: 620, anchor: 'left' as const },
  { id: 'cap', x: 520, y: 560, anchor: 'right' as const },
  { id: 'epitech', x: 230, y: 420, anchor: 'left' as const },
  { id: 'spayr', x: 540, y: 320, anchor: 'right' as const },
];

const mainTrail = `M 400 870 L 400 760 L ${SVG_STOPS[0].x} ${SVG_STOPS[0].y}`;
const leftBranch = `M ${SVG_STOPS[0].x} ${SVG_STOPS[0].y} Q 330 700 ${SVG_STOPS[1].x} ${SVG_STOPS[1].y} Q 220 520 ${SVG_STOPS[3].x} ${SVG_STOPS[3].y}`;
const rightBranch = `M ${SVG_STOPS[0].x} ${SVG_STOPS[0].y} Q 460 660 ${SVG_STOPS[2].x} ${SVG_STOPS[2].y} Q 560 440 ${SVG_STOPS[4].x} ${SVG_STOPS[4].y}`;

const CONTOURS = [
  { rx: 70, ry: 35, master: false },
  { rx: 130, ry: 75, master: false },
  { rx: 200, ry: 130, master: true },
  { rx: 270, ry: 195, master: false },
  { rx: 340, ry: 260, master: false },
  { rx: 410, ry: 325, master: true },
  { rx: 480, ry: 395, master: false },
  { rx: 550, ry: 470, master: false },
];

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function mapRange(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}

export default function JourneyTopo() {
  const ref = useRef<HTMLElement | null>(null);
  const p = useScrollProgress(ref);

  // Phase progressions
  const introOut = mapRange(p, 0.06, 0.18);
  const contoursIn = mapRange(p, 0.05, 0.30);
  const mainDraw = mapRange(p, 0.18, 0.38);
  const branchesDraw = mapRange(p, 0.34, 0.68);
  const stopReveal = (i: number) => mapRange(p, 0.20 + i * 0.10, 0.30 + i * 0.10);
  const outroIn = mapRange(p, 0.86, 0.98);

  return (
    <section
      ref={ref}
      id="journey"
      className="journey-topo relative"
      style={{ height: '380vh', background: PAPER, color: INK }}
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Paper grain + subtle warm tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% 40%, transparent 0%, rgba(196,158,63,0.06) 80%), repeating-linear-gradient(135deg, transparent 0 4px, rgba(26,22,18,0.012) 4px 8px)',
          }}
        />

        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: '38% 1fr',
            padding: 'clamp(40px, 5vh, 80px) clamp(32px, 5vw, 80px)',
            gap: 'clamp(24px, 4vw, 64px)',
          }}
        >
          {/* LEFT — editorial column */}
          <div className="relative flex flex-col justify-between">
            <div>
              <div
                className="inline-flex items-center gap-3 mb-10"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: ROUGE,
                }}
              >
                <span style={{ width: 28, height: 1, background: ROUGE }} />
                Chapitre IV · La carte
              </div>

              <h2
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontSize: 'clamp(40px, 5.4vw, 76px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.01em',
                  color: INK,
                  marginBottom: 28,
                  maxWidth: '14ch',
                }}
              >
                Une <em style={{ fontStyle: 'italic', color: ROUGE }}>carte</em> du chemin parcouru.
              </h2>

              <p
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontSize: 'clamp(16px, 1.25vw, 19px)',
                  lineHeight: 1.55,
                  color: 'rgba(26,22,18,0.78)',
                  maxWidth: '36ch',
                  marginBottom: 18,
                }}
              >
                Le tracé se dessine au fil du scroll. Deux voies parallèles qui montent ensemble — l'école à l'ouest, l'alternance à l'est. Le sommet reste à venir.
              </p>
            </div>

            {/* Legend block */}
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(26,22,18,0.65)',
                borderTop: `1px solid ${INK}22`,
                paddingTop: 18,
              }}
            >
              <div style={{ marginBottom: 10, color: INK }}>Légende</div>
              <LegendRow color={VEGE} label="Formation · école" />
              <LegendRow color={ROUGE} label="Expérience · alternance" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <span style={{ width: 14, height: 0, borderTop: `1.5px solid ${INK}` }} />
                <span style={{ width: 14, height: 0, borderTop: `1.5px dashed ${INK}` }} />
                <span style={{ marginLeft: 4 }}>Achevé · en cours</span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 22 }}>
                <span>N ↑</span>
                <span>Éch. 1 : 1 paliers · 5 ans</span>
              </div>
            </div>
          </div>

          {/* RIGHT — map */}
          <div className="relative">
            <svg
              viewBox="0 0 800 920"
              preserveAspectRatio="xMidYMid meet"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              {/* Contour lines */}
              <g style={{ opacity: contoursIn }}>
                {CONTOURS.map((c, i) => (
                  <ellipse
                    key={i}
                    cx={SUMMIT.x}
                    cy={SUMMIT.y + c.ry * 0.15}
                    rx={c.rx}
                    ry={c.ry}
                    fill="none"
                    stroke={OCHRE}
                    strokeOpacity={c.master ? 0.7 : 0.32}
                    strokeWidth={c.master ? 1.4 : 0.8}
                    strokeDasharray={c.master ? undefined : '0'}
                  />
                ))}
              </g>

              {/* Faint altitude labels on contours */}
              <g
                style={{ opacity: contoursIn * 0.6 }}
                fontFamily="Instrument Serif, serif"
                fontStyle="italic"
                fontSize="11"
                fill={INK}
                fillOpacity={0.55}
              >
                <text x={SUMMIT.x + 90} y={SUMMIT.y + 130} transform={`rotate(-12 ${SUMMIT.x + 90} ${SUMMIT.y + 130})`}>3 800 m</text>
                <text x={SUMMIT.x + 180} y={SUMMIT.y + 270} transform={`rotate(-10 ${SUMMIT.x + 180} ${SUMMIT.y + 270})`}>3 000 m</text>
                <text x={SUMMIT.x + 280} y={SUMMIT.y + 430} transform={`rotate(-8 ${SUMMIT.x + 280} ${SUMMIT.y + 430})`}>2 200 m</text>
                <text x={SUMMIT.x + 360} y={SUMMIT.y + 590} transform={`rotate(-6 ${SUMMIT.x + 360} ${SUMMIT.y + 590})`}>1 400 m</text>
              </g>

              {/* Forest band (low altitude) */}
              <g style={{ opacity: contoursIn * 0.5 }}>
                {Array.from({ length: 30 }).map((_, i) => (
                  <text
                    key={i}
                    x={70 + ((i * 37) % 700)}
                    y={830 + ((i * 19) % 50)}
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="9"
                    fill={VEGE}
                    fillOpacity={0.7}
                  >
                    ♣
                  </text>
                ))}
              </g>

              {/* Compass rose */}
              <g transform="translate(720, 80)" style={{ opacity: contoursIn }}>
                <circle r="22" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="0.6" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke={INK} strokeOpacity="0.6" strokeWidth="0.6" />
                <line x1="-22" y1="0" x2="22" y2="0" stroke={INK} strokeOpacity="0.4" strokeWidth="0.6" />
                <polygon points="0,-22 -4,-12 0,-16 4,-12" fill={ROUGE} />
                <text x="0" y="-28" textAnchor="middle" fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="12" fill={INK}>N</text>
              </g>

              {/* Summit marker */}
              <g transform={`translate(${SUMMIT.x} ${SUMMIT.y})`} style={{ opacity: contoursIn }}>
                <polygon points="0,-10 -6,2 6,2" fill={INK} />
                <text
                  x="14"
                  y="2"
                  fontFamily="Instrument Serif, serif"
                  fontStyle="italic"
                  fontSize="14"
                  fill={INK}
                >
                  Mont-Blanc · 4 810 m
                </text>
              </g>

              {/* Trail — main */}
              <DrawnPath d={mainTrail} progress={mainDraw} color={ROUGE} width={2.4} />

              {/* Trail — left branch (école) */}
              <DrawnPath d={leftBranch} progress={branchesDraw} color={VEGE} width={2.2} dashed />

              {/* Trail — right branch (alternance) */}
              <DrawnPath d={rightBranch} progress={branchesDraw} color={ROUGE} width={2.2} />

              {/* Valley start marker */}
              <g style={{ opacity: mainDraw }}>
                <circle cx="400" cy="870" r="4" fill={INK} />
                <text
                  x="400"
                  y="900"
                  textAnchor="middle"
                  fontFamily="Instrument Serif, serif"
                  fontStyle="italic"
                  fontSize="13"
                  fill={INK}
                  fillOpacity={0.75}
                >
                  Vallée · 1 035 m · 2021
                </text>
              </g>

              {/* Stops with annotations */}
              {SVG_STOPS.map((svgStop, i) => {
                const stop = STOPS.find((s) => s.id === svgStop.id)!;
                const op = stopReveal(i);
                const color = stop.type === 'edu' ? VEGE : ROUGE;
                const labelX = svgStop.anchor === 'left' ? svgStop.x - 16 : svgStop.x + 16;
                const labelAnchor = svgStop.anchor === 'left' ? 'end' : 'start';
                return (
                  <g key={svgStop.id} style={{ opacity: op, transform: `translateY(${(1 - op) * 6}px)` }}>
                    <circle cx={svgStop.x} cy={svgStop.y} r="6" fill={PAPER} stroke={color} strokeWidth="2" />
                    {stop.ongoing && (
                      <circle
                        cx={svgStop.x}
                        cy={svgStop.y}
                        r="11"
                        fill="none"
                        stroke={color}
                        strokeWidth="1"
                        strokeOpacity="0.4"
                      >
                        <animate attributeName="r" values="6;14;6" dur="2.2s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <text
                      x={labelX}
                      y={svgStop.y - 2}
                      textAnchor={labelAnchor}
                      fontFamily="Instrument Serif, serif"
                      fontStyle="italic"
                      fontSize="16"
                      fill={INK}
                    >
                      {stop.title}
                    </text>
                    <text
                      x={labelX}
                      y={svgStop.y + 14}
                      textAnchor={labelAnchor}
                      fontFamily="JetBrains Mono, monospace"
                      fontSize="9"
                      letterSpacing="0.14em"
                      fill={INK}
                      fillOpacity={0.6}
                    >
                      {stop.altitude} m · {stop.year.split(' — ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Cartographic title block (bottom-left) */}
              <g transform="translate(40, 870)" style={{ opacity: contoursIn }}>
                <text
                  fontFamily="Instrument Serif, serif"
                  fontSize="14"
                  fill={INK}
                  fillOpacity={0.7}
                >
                  Massif du Mont-Blanc — Itinéraire B. Boutrois
                </text>
                <text
                  y="16"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  letterSpacing="0.22em"
                  fill={INK}
                  fillOpacity={0.5}
                >
                  RELEVÉ · MMXXI — MMXXVI
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* INTRO — first frame */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${PAPER} 0%, ${PAPER}f0 60%, ${PAPER}00 100%)`,
            opacity: 1 - introOut,
            transition: 'opacity 0.1s linear',
          }}
        >
          <div style={{ maxWidth: 720, padding: '0 5vw', textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: ROUGE,
                marginBottom: 18,
              }}
            >
              Carte IGN · Échelle perso
            </div>
            <h2
              style={{
                fontFamily: 'Instrument Serif, serif',
                fontSize: 'clamp(40px, 6vw, 80px)',
                lineHeight: 0.95,
                color: INK,
                marginBottom: 14,
              }}
            >
              Un parcours, <em style={{ fontStyle: 'italic', color: ROUGE }}>relevé</em>.
            </h2>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(26,22,18,0.55)',
                marginTop: 36,
              }}
            >
              ↓ continuez à scroller — le tracé se dessine
            </div>
          </div>
        </div>

        {/* OUTRO */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background: `linear-gradient(0deg, ${PAPER} 0%, ${PAPER}f0 60%, ${PAPER}00 100%)`,
            opacity: outroIn,
            transition: 'opacity 0.1s linear',
          }}
        >
          <div style={{ maxWidth: 720, padding: '0 5vw', textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: ROUGE,
                marginBottom: 18,
              }}
            >
              Relevé partiel
            </div>
            <h2
              style={{
                fontFamily: 'Instrument Serif, serif',
                fontSize: 'clamp(34px, 4.8vw, 60px)',
                lineHeight: 1.05,
                color: INK,
                marginBottom: 24,
                maxWidth: '20ch',
                margin: '0 auto 24px',
              }}
            >
              5 paliers franchis. Le <em style={{ color: ROUGE, fontStyle: 'italic' }}>sommet</em> reste à venir.
            </h2>
            <div
              style={{
                display: 'inline-grid',
                gridTemplateColumns: 'repeat(3, auto)',
                gap: '0 36px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(26,22,18,0.7)',
                paddingTop: 18,
                borderTop: `1px solid ${INK}33`,
              }}
            >
              <span>Départ · 1 035 m</span>
              <span style={{ color: ROUGE }}>Position · 3 050 m</span>
              <span>Sommet · 4 810 m</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: `1px solid ${INK}33` }} />
      <span>{label}</span>
    </div>
  );
}

function DrawnPath({
  d,
  progress,
  color,
  width,
  dashed = false,
}: {
  d: string;
  progress: number;
  color: string;
  width: number;
  dashed?: boolean;
}) {
  const ref = useRef<SVGPathElement | null>(null);
  const len = ref.current?.getTotalLength?.() ?? 1000;
  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? `5 5` : `${len}`}
      strokeDashoffset={dashed ? 0 : len * (1 - progress)}
      style={{ opacity: dashed ? Math.min(1, progress * 1.2) : 1 }}
    />
  );
}
