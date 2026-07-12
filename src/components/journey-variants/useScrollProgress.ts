import { useEffect, useState } from 'react';

/**
 * Returns 0→1 progress across a section element.
 * 0 = top of section just hit viewport top, 1 = bottom about to leave.
 *
 * `smoothTau` (secondes) — constante de temps d'un lissage exponentiel
 * optionnel : la valeur retournée glisse vers la position réelle du scroll
 * au lieu de suivre chaque cran de molette. 0 (défaut) = valeur brute.
 */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>, smoothTau = 0) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let target = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      target = total <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / total));
    };

    if (smoothTau <= 0) {
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          measure();
          setProgress(target);
        });
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        cancelAnimationFrame(raf);
      };
    }

    // Lissage exponentiel « réveil sur scroll, sommeil quand convergé ».
    // PERF/CHAUFFE : la boucle rAF ne tourne QUE pendant la glissade (pendant et
    // ~0,5 s après un scroll). Immobile, aucun rAF → zéro CPU. C'est ce qui
    // évite que la machine chauffe en permanence.
    let current = 0;
    let last = 0;
    let running = false;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      measure();
      const delta = target - current;
      if (Math.abs(delta) < 0.0004) {
        if (current !== target) {
          current = target;
          setProgress(current);
        }
        running = false; // convergé → on arrête la boucle (réveil au prochain scroll)
        return;
      }
      current += delta * (1 - Math.exp(-dt / smoothTau));
      setProgress(current);
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      measure();
      if (!running && Math.abs(target - current) >= 0.0004) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    measure();
    current = target;
    setProgress(current);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    return () => {
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      cancelAnimationFrame(raf);
    };
  }, [ref, smoothTau]);

  return progress;
}
