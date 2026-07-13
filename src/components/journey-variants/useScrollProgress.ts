import { useEffect, useRef } from 'react';

/**
 * Pilote de progression 0→1 à travers une section.
 * 0 = le haut de la section touche le haut du viewport, 1 = le bas va sortir.
 *
 * PERF — pourquoi un callback et pas un state React : un state mis à jour à
 * chaque frame re-rendait TOUT l'arbre de la section (~70 éléments, styles
 * inline re-diffés) 60 fois par seconde pendant le scroll — la source du jank
 * sur mobile. Ici, `onFrame(p)` écrit directement transform/opacity sur des
 * refs DOM : React ne re-rend jamais pendant le scroll.
 *
 * `smoothTau` (secondes) — constante de temps d'un lissage exponentiel
 * optionnel : la valeur glisse vers la position réelle du scroll au lieu de
 * suivre chaque cran de molette. 0 = valeur brute (un appel par frame de
 * scroll, aucune boucle continue). La boucle de lissage dort dès que la
 * valeur a convergé — immobile, zéro CPU.
 */
export function useScrollDriver(
  ref: React.RefObject<HTMLElement | null>,
  smoothTau: number,
  onFrame: (p: number) => void,
) {
  // Le callback vit dans une ref : le re-render du composant parent ne
  // ré-abonne pas les listeners.
  const cb = useRef(onFrame);
  cb.current = onFrame;

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
          cb.current(target);
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
          cb.current(current);
        }
        running = false; // convergé → on arrête la boucle (réveil au prochain scroll)
        return;
      }
      current += delta * (1 - Math.exp(-dt / smoothTau));
      cb.current(current);
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
    cb.current(current);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', wake);
    return () => {
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', wake);
      cancelAnimationFrame(raf);
    };
  }, [ref, smoothTau]);
}
