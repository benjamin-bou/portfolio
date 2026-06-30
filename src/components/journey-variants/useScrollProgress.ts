import { useEffect, useState } from 'react';

/** Returns 0→1 progress across a section element. 0 = top of section just hit viewport top, 1 = bottom about to leave. */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height - vh;
        if (total <= 0) {
          setProgress(0);
          return;
        }
        const scrolled = -rect.top;
        const p = Math.max(0, Math.min(1, scrolled / total));
        setProgress(p);
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
  }, [ref]);

  return progress;
}
