import { useEffect, useState } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Terminal from './components/Terminal';
import EmbersCanvas from './components/EmbersCanvas';
import ChapterI from './components/ChapterI';
import Gallery from './components/Gallery';
import Journey3D from './components/Journey3D';
import JourneyTopo from './components/journey-variants/JourneyTopo';
import JourneyCockpit from './components/journey-variants/JourneyCockpit';
import JourneyLitho from './components/journey-variants/JourneyLitho';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { useReveal } from './hooks/useReveal';
import { useScrollEffects } from './hooks/useScrollEffects';
import { useGlowCursor } from './hooks/useGlowCursor';
import { useParallax } from './hooks/useParallax';

type JourneyVariant = '3d' | 'topo' | 'cockpit' | 'litho';

function readVariant(): JourneyVariant {
  const h = window.location.hash.replace('#', '');
  if (h === 'topo' || h === 'cockpit' || h === 'litho') return h;
  return '3d';
}

function App() {
  useReveal();
  useScrollEffects();
  useGlowCursor();
  useParallax();

  const [variant, setVariant] = useState<JourneyVariant>('3d');

  useEffect(() => {
    setVariant(readVariant());
    const onHash = () => setVariant(readVariant());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const setHash = (v: JourneyVariant) => {
    if (v === '3d') history.replaceState(null, '', window.location.pathname);
    else window.location.hash = v;
    setVariant(v);
  };

  return (
    <>
      <div id="progress-bar" className="progress-bar" />
      <div id="glow-cursor" className="glow-cursor" />
      <div className="vignette" />
      <EmbersCanvas />

      <Nav />
      <Terminal />

      <main>
        <Hero />
        <About />
        <ChapterI />
        <Gallery />
        {variant === '3d' && <Journey3D />}
        {variant === 'topo' && <JourneyTopo />}
        {variant === 'cockpit' && <JourneyCockpit />}
        {variant === 'litho' && <JourneyLitho />}
        <CTA />
      </main>

      <Footer />

      <VariantSwitcher current={variant} onChange={setHash} />
    </>
  );
}

function VariantSwitcher({
  current,
  onChange,
}: {
  current: JourneyVariant;
  onChange: (v: JourneyVariant) => void;
}) {
  const [open, setOpen] = useState(false);
  const labels: Record<JourneyVariant, string> = {
    '3d': '3D · Mont-Blanc',
    topo: 'Carte IGN',
    cockpit: 'Cockpit',
    litho: 'Litho PLM',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 100,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {open ? (
        <div
          style={{
            background: 'rgba(20,10,6,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,176,87,0.3)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 200,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.32em',
              color: 'rgba(243,232,216,0.55)',
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Section ascension</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(243,232,216,0.55)',
                cursor: 'pointer',
                padding: 0,
                fontSize: 12,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          {(Object.keys(labels) as JourneyVariant[]).map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              style={{
                textAlign: 'left',
                background: current === v ? 'rgba(255,106,31,0.18)' : 'transparent',
                border: 'none',
                color: current === v ? '#ffb057' : 'rgba(243,232,216,0.82)',
                padding: '8px 10px',
                fontFamily: 'inherit',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (current !== v) e.currentTarget.style.background = 'rgba(255,176,87,0.08)';
              }}
              onMouseLeave={(e) => {
                if (current !== v) e.currentTarget.style.background = 'transparent';
              }}
            >
              {current === v ? '▸ ' : '  '}
              {labels[v]}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'rgba(20,10,6,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,176,87,0.3)',
            color: '#ffb057',
            padding: '10px 14px',
            fontFamily: 'inherit',
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6a1f' }} />
          {labels[current]}
        </button>
      )}
    </div>
  );
}

export default App;
