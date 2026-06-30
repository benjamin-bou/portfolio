export default function Footer() {
  return (
    <footer
      className="border-t border-cream/10 text-[11px] uppercase tracking-[0.2em] text-muted flex justify-between flex-wrap gap-4"
      style={{ padding: '40px clamp(24px, 5vw, 80px)' }}
    >
      <div>© 2026 · Benjamin Boutrois</div>
      <div className="flex items-center gap-3">
        <a
          href="https://www.linkedin.com/in/benjamin-boutrois-2640462b0/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-cream transition-colors"
        >
          LinkedIn
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/benjamin-bou"
          target="_blank"
          rel="noreferrer"
          className="hover:text-cream transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
