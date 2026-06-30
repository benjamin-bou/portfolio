import { useEffect } from 'react';

/** Progress bar + nav blur + sun/sky parallax + nav-title fade in/out around hero & CTA. */
export function useScrollEffects() {
  useEffect(() => {
    const progress = document.getElementById('progress-bar');
    const nav = document.getElementById('nav');
    const navTitle = nav?.querySelector('.nav-title');
    const sun = document.getElementById('hero-sun');
    const sky = document.getElementById('hero-sky');
    const cta = document.getElementById('contact');
    const ctaName = cta?.querySelector('.cta-name');

    let pastHero = false;
    let ctaInView = false;

    function syncTitles() {
      if (navTitle) {
        // Visible when we've scrolled past most of the hero, hidden again once the CTA
        // (which already shows the name big) comes into view.
        navTitle.classList.toggle('visible', pastHero && !ctaInView);
      }
      if (ctaName) {
        // Same fade pattern, mirrored direction — appears as the section enters.
        ctaName.classList.toggle('visible', ctaInView);
      }
    }

    function onScroll() {
      const s = window.scrollY;
      const vh = window.innerHeight;
      const h = document.documentElement.scrollHeight - vh;
      if (progress) progress.style.width = (s / h) * 100 + '%';
      if (nav) nav.classList.toggle('scrolled', s > 50);
      const nextPastHero = s > vh * 0.6;
      if (nextPastHero !== pastHero) {
        pastHero = nextPastHero;
        syncTitles();
      }
      if (s < vh) {
        if (sun) sun.style.transform = `translateX(-50%) translateY(${s * -0.3}px)`;
        if (sky) sky.style.transform = `translateY(${s * 0.15}px)`;
      }
    }

    // CTA visibility — when the section's top is in the upper 50% of the viewport, treat it as in view.
    const ctaIO = cta
      ? new IntersectionObserver(
          (entries) => {
            ctaInView = entries[0]?.isIntersecting ?? false;
            syncTitles();
          },
          { rootMargin: '0px 0px -50% 0px' },
        )
      : null;
    if (ctaIO && cta) ctaIO.observe(cta);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      ctaIO?.disconnect();
    };
  }, []);
}
