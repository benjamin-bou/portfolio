export default function Nav() {
  return (
    <nav
      id="nav"
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center text-white text-[11px] uppercase tracking-[0.2em] transition-[backdrop-filter,background] duration-400 [&.scrolled]:bg-deep/60 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-b [&.scrolled]:border-cream/10"
      style={{ padding: '22px clamp(24px, 4vw, 48px)' }}
    >
      <div className="nav-title font-serif text-[20px] tracking-normal normal-case">
        Benjamin{' '}
        <em
          className="italic"
          style={{
            background: 'linear-gradient(180deg, var(--orange-glow), var(--orange))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'normal',
          }}
        >
          Boutrois
        </em>
      </div>
      <ul className="hidden md:flex gap-7 list-none">
        <li>
          <a href="#work" className="nav-link relative text-inherit no-underline transition-colors duration-300 hover:text-orange-hot">
            Projets
          </a>
        </li>
        <li>
          <a href="#journey" className="nav-link relative text-inherit no-underline transition-colors duration-300 hover:text-orange-hot">
            Parcours
          </a>
        </li>
        <li>
          <a href="#contact" className="nav-link relative text-inherit no-underline transition-colors duration-300 hover:text-orange-hot">
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}
