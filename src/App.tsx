import Nav from './components/Nav';
import Hero from './components/Hero';
import Terminal from './components/Terminal';
import EmbersCanvas from './components/EmbersCanvas';
import ChapterI from './components/ChapterI';
import Parallax from './components/Parallax';
import Marquee from './components/Marquee';
import Gallery from './components/Gallery';
import Process from './components/Process';
import Journey from './components/Journey';
import CTA from './components/CTA';
import Footer from './components/Footer';
import { useReveal } from './hooks/useReveal';
import { useScrollEffects } from './hooks/useScrollEffects';
import { useGlowCursor } from './hooks/useGlowCursor';
import { useParallax } from './hooks/useParallax';

function App() {
  useReveal();
  useScrollEffects();
  useGlowCursor();
  useParallax();

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
        <ChapterI />
        <Parallax variant="mountain" kicker="Philosophie">
          Avancer pas à pas,<br />dans une <em className="italic" style={{
            background: 'linear-gradient(180deg, var(--orange-glow), var(--orange))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>direction claire</em>.
        </Parallax>
        <Marquee />
        <Gallery />
        <Process />
        <Journey />
        <Parallax variant="desk" kicker="Au quotidien">
          Du code, des <em className="italic" style={{
            background: 'linear-gradient(180deg, var(--orange-glow), var(--orange))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>tests</em>, des cafés. Et des livraisons.
        </Parallax>
        <CTA />
      </main>

      <Footer />
    </>
  );
}

export default App;
