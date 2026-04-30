import { useEffect, useRef } from 'react';

export default function CTA() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const btn = btnRef.current;
    if (!wrap || !btn) return;
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
    };
    const onLeave = () => {
      btn.style.transform = '';
    };
    wrap.addEventListener('mousemove', onMove);
    wrap.addEventListener('mouseleave', onLeave);
    return () => {
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      id="contact"
      className="cta-bg relative overflow-hidden text-center"
      style={{ padding: 'clamp(80px, 16vh, 180px) clamp(24px, 5vw, 80px) clamp(60px, 10vh, 120px)' }}
    >
      <div className="reveal relative z-[1] font-serif italic text-[18px] mb-2.5 text-orange-hot">
        Envie d'en discuter&nbsp;?
      </div>
      <h3
        className="reveal delay-1 font-serif font-normal text-white relative max-w-[14ch] mx-auto mb-12"
        style={{ fontSize: 'clamp(48px, 8vw, 130px)', lineHeight: 1, letterSpacing: '-0.025em' }}
      >
        On{' '}
        <em
          className="italic"
          style={{
            background: 'linear-gradient(180deg, var(--orange-glow), var(--orange))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          construit
        </em>{' '}
        quelque chose ensemble ?
      </h3>
      <div className="reveal delay-2">
        <div ref={wrapRef} className="cta-wrap inline-block relative">
          <a
            ref={btnRef}
            href="mailto:benjaminboutrois04@gmail.com"
            className="cta-btn inline-flex items-center gap-3.5 py-[18px] px-8 bg-transparent border border-orange-hot text-cream no-underline text-xs uppercase tracking-[0.28em] rounded-full relative overflow-hidden z-[1] transition-colors duration-400 hover:text-deep hover:border-orange will-change-transform"
          >
            <span>Prendre contact</span>
            <span className="transition-transform duration-400 group-hover:translate-x-1.5">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
