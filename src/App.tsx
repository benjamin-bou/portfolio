import Nav from './components/Nav';
import Hero from './components/Hero';
import Terminal from './components/Terminal';
import EmbersCanvas from './components/EmbersCanvas';
import ChapterI from './components/ChapterI';
import Marquee from './components/Marquee';
import Gallery from './components/Gallery';
import Journey3D from './components/Journey3D';
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
        <Marquee />
        <Gallery />
        <Journey3D />
        <CTA />
      </main>

      <Footer />
    </>
  );
}

export default App;
