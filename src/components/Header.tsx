import { useState, useEffect } from 'react'
import { HiSun, HiMoon } from 'react-icons/hi2'

const Header = () => {
  const [isDark, setIsDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Check initial dark mode preference
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(darkModePreference)

    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    // In a real implementation, you would persist this to localStorage
    // and update the document class or data attribute
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navLinks = [
    { label: 'Accueil', href: 'hero' },
    { label: 'À propos', href: 'about' },
    { label: 'Projets', href: 'projects' },
    { label: 'Contact', href: 'contact' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-corporate-dark/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            BB
          </button>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-warm-orange dark:hover:text-warm-orange-light transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <HiSun className="w-5 h-5 text-warm-orange" />
            ) : (
              <HiMoon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Header
