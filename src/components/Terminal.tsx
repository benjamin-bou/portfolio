import { useEffect, useRef, useState } from 'react';

type Segment = { cls: string; text: string };
type State = { id: string; title: string; segments: Segment[] };

const S = (cls: string, text: string): Segment => ({ cls, text });

const STATES: State[] = [
  {
    id: 'hero',
    title: '~/benjamin — zsh',
    segments: [
      S('tl-prompt', '$ '), S('tl-cmd', 'whoami'), S('', '\n'),
      S('tl-out', 'benjamin.boutrois\n'),
      S('tl-prompt', '$ '), S('tl-cmd', 'cat bio.txt'), S('', '\n'),
      S('tl-out', 'Développeur full-stack\n'),
      S('tl-out', 'École : Epitech Rennes · promo 2027\n'),
      S('tl-out', 'Alternance : Spayr · Paris\n'),
      S('tl-prompt', '$ '), S('tl-cursor', '▍'),
    ],
  },
  {
    id: 'chapter1',
    title: '~/benjamin/skills — zsh',
    segments: [
      S('tl-prompt', '$ '), S('tl-cmd', 'cat stack.json'), S('', '\n'),
      S('tl-out', '{\n  "front": ["React", "TypeScript", "Vite"],\n  "back":  ["Node", "PostgreSQL", "REST"],\n  "tools": ["Git", "Docker", "Figma"]\n}\n'),
      S('tl-prompt', '$ '), S('tl-cursor', '▍'),
    ],
  },
  {
    id: 'work',
    title: '~/benjamin/projects — zsh',
    segments: [
      S('tl-prompt', '$ '), S('tl-cmd', 'ls -la projects/'), S('', '\n'),
      S('tl-out', 'drwxr-xr-x  spayr/        (prod)\n'),
      S('tl-out', 'drwxr-xr-x  cap-achat/    (alternance)\n'),
      S('tl-out', 'drwxr-xr-x  school-app/   (Epitech)\n'),
      S('tl-out', 'drwxr-xr-x  portfolio/    (perso)\n'),
      S('tl-prompt', '$ '), S('tl-cursor', '▍'),
    ],
  },
  {
    id: 'journey',
    title: '~/benjamin — git',
    segments: [
      S('tl-prompt', '$ '), S('tl-cmd', 'git log --oneline'), S('', '\n'),
      S('tl-out', '2025  Epitech · master (HEAD)\n'),
      S('tl-out', '2025  Spayr · alternance\n'),
      S('tl-out', '2024  Cap Achat · alternance\n'),
      S('tl-out', '2024  Bachelor dev web\n'),
      S('tl-out', '2021  Licence informatique\n'),
      S('tl-prompt', '$ '), S('tl-cursor', '▍'),
    ],
  },
];

const SECTION_MAP: { sel: string; state: number }[] = [
  { sel: '.hero', state: 0 },
  { sel: '.chapter-i', state: 1 },
  { sel: '.gallery', state: 2 },
  { sel: '.journey', state: 3 },
];

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const currentStateRef = useRef(-1);
  const queueRef = useRef<number[]>([]);
  const typingRef = useRef(false);

  function removeCursors() {
    const b = bodyRef.current;
    if (!b) return;
    b.querySelectorAll('.tl-cursor').forEach((c) => c.remove());
  }

  function scrollToBottom() {
    const b = bodyRef.current;
    if (!b) return;
    b.scrollTop = b.scrollHeight;
  }

  function typeSegments(segments: Segment[], done: () => void) {
    const body = bodyRef.current;
    if (!body) {
      done();
      return;
    }
    removeCursors();
    let i = 0;
    let c = 0;
    const perChar = 18;
    let currentNode: HTMLSpanElement | null = null;

    function step() {
      if (i >= segments.length) {
        scrollToBottom();
        done();
        return;
      }
      const seg = segments[i];

      if (seg.cls === 'tl-cursor') {
        const span = document.createElement('span');
        span.className = 'tl-cursor';
        span.textContent = seg.text;
        body!.appendChild(span);
        scrollToBottom();
        i++;
        c = 0;
        currentNode = null;
        step();
        return;
      }

      if (c === 0) {
        currentNode = document.createElement('span');
        if (seg.cls) currentNode.className = seg.cls;
        body!.appendChild(currentNode);
      }
      c++;
      currentNode!.textContent = seg.text.slice(0, c);
      scrollToBottom();

      if (c >= seg.text.length) {
        i++;
        c = 0;
        currentNode = null;
        setTimeout(step, seg.cls === 'tl-cmd' ? 90 : perChar);
      } else {
        const instant = seg.cls === 'tl-prompt';
        setTimeout(step, instant ? 0 : perChar);
      }
    }
    step();
  }

  function runQueue() {
    if (queueRef.current.length === 0) {
      typingRef.current = false;
      return;
    }
    typingRef.current = true;
    const idx = queueRef.current.shift()!;
    if (titleRef.current) titleRef.current.textContent = STATES[idx].title;
    typeSegments(STATES[idx].segments, runQueue);
  }

  function appendState(idx: number) {
    if (idx === currentStateRef.current) return;
    currentStateRef.current = idx;
    queueRef.current.push(idx);
    if (!typingRef.current) runQueue();
  }

  // Pick state on scroll
  useEffect(() => {
    function pick() {
      const mid = window.scrollY + window.innerHeight * 0.45;
      let picked = 0;
      SECTION_MAP.forEach(({ sel, state }) => {
        const el = document.querySelector<HTMLElement>(sel);
        if (!el) return;
        if (mid >= el.offsetTop) picked = state;
      });
      appendState(picked);
    }
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    pick();
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, []);

  // Prime current state on first open
  function handleOpen() {
    setOpen(true);
    if (currentStateRef.current === -1) {
      const mid = window.scrollY + window.innerHeight * 0.45;
      let picked = 0;
      SECTION_MAP.forEach(({ sel, state }) => {
        const el = document.querySelector<HTMLElement>(sel);
        if (!el) return;
        if (mid >= el.offsetTop) picked = state;
      });
      appendState(picked);
    }
  }

  return (
    <>
      {/* Launcher icon */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Ouvrir le terminal"
        title="Ouvrir le terminal"
        className={`terminal-icon fixed z-[41] w-[54px] h-[54px] rounded-[14px] flex items-center justify-center cursor-pointer transition-all duration-400 ${
          open ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100'
        } hover:scale-110 hover:-translate-y-0.5`}
        style={{
          right: 'clamp(24px, 4vw, 56px)',
          top: '25vh',
          background: 'rgba(15,8,4,.82)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,176,87,.3)',
          boxShadow:
            '0 12px 30px rgba(0,0,0,.45), 0 0 24px rgba(255,106,31,.2), 0 0 0 1px rgba(255,106,31,.08) inset',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="w-[22px] h-[22px] stroke-orange-hot fill-none transition-[stroke] duration-300 hover:stroke-white"
          style={{ strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }}
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9l3 3-3 3" />
          <path d="M12 15h5" />
        </svg>
        <span className="terminal-icon-dot" aria-hidden="true" />
      </button>

      {/* Terminal panel */}
      <div
        className={`terminal-panel ${open ? 'open' : ''} fixed z-40`}
        style={{
          right: 'clamp(24px, 4vw, 56px)',
          top: 'clamp(96px, 18vh, 180px)',
          width: 'min(420px, 34vw)',
        }}
        aria-hidden={!open}
      >
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-cream/10 bg-black/30 relative">
          <span
            role="button"
            tabIndex={0}
            aria-label="Fermer le terminal"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(false);
              }
            }}
            className="terminal-close"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28ca42]" />
          <div
            ref={titleRef}
            className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-cream/50"
          >
            ~/benjamin — zsh
          </div>
        </div>
        <div ref={bodyRef} className="terminal-body" />
      </div>
    </>
  );
}
