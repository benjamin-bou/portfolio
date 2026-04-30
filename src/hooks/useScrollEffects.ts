import { useEffect } from 'react';

/** Progress bar + nav blur + sun/sky parallax in hero. */
export function useScrollEffects() {
  useEffect(() => {
    const progress = document.getElementById('progress-bar');
    const nav = document.getElementById('nav');
    const sun = document.getElementById('hero-sun');
    const sky = document.getElementById('hero-sky');

    function onScroll() {
      const s = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (s / h) * 100 + '%';
      if (nav) nav.classList.toggle('scrolled', s > 50);
      if (s < window.innerHeight) {
        if (sun) sun.style.transform = `translateX(-50%) translateY(${s * -0.3}px)`;
        if (sky) sky.style.transform = `translateY(${s * 0.15}px)`;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
