import { useState } from 'react'

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Trigger animation after component mounts
  if (!isVisible) {
    setTimeout(() => setIsVisible(true), 50)
  }

  const techStack = [
    { name: 'React', status: 'expert' },
    { name: 'PHP', status: 'expert' },
    { name: 'Rails', status: 'learning' },
    { name: 'React Native', status: 'learning' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-8 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-corporate-dark dark:via-slate-900 dark:to-slate-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute -top-64 -right-24 w-96 h-96 bg-warm-orange/20 dark:bg-warm-orange-light/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-48 -left-24 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float [animation-delay:2s]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Name */}
        <div className={`mb-2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-3 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
            Benjamin Boutrois
          </h1>
          <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-warm-orange to-transparent rounded-full transform scale-x-0 animate-expand-width [animation-delay:300ms]" />
        </div>

        {/* Role */}
        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-medium text-slate-600 dark:text-slate-400 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Full Stack Developer
        </h2>

        {/* Description */}
        <div className="space-y-2 mb-10 max-w-2xl mx-auto">
          <p className={`text-base sm:text-lg text-slate-600 dark:text-slate-300 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Étudiant en alternance passionné par le développement web modern.
          </p>
          <p className={`text-base sm:text-lg text-slate-500 dark:text-slate-400 transition-all duration-700 delay-[400ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Je cherche à relever de nouveaux défis.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {techStack.map((tech, index) => (
            <span
              key={tech.name}
              className={`group relative px-5 py-2.5 rounded-full border-2 font-medium text-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                tech.status === 'expert'
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-warm-orange hover:shadow-lg hover:shadow-warm-orange/20'
                  : 'bg-orange-50 dark:bg-warm-orange/10 border-orange-200 dark:border-warm-orange/30 text-warm-orange dark:text-warm-orange-light hover:border-warm-orange hover:shadow-lg hover:shadow-warm-orange/20'
              } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}
              style={{
                transitionDelay: `${600 + index * 100}ms`,
                animationDelay: `${600 + index * 100}ms`
              }}
            >
              <span className="flex items-center gap-2">
                {tech.name}
                {tech.status === 'learning' && (
                  <span className="text-xs px-2 py-0.5 bg-warm-orange/20 dark:bg-warm-orange/30 rounded-full font-semibold">
                    en cours
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-[800ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button className="group relative px-8 py-3.5 rounded-full font-semibold text-base overflow-hidden bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white shadow-lg shadow-warm-orange/30 hover:shadow-xl hover:shadow-warm-orange/40 hover:-translate-y-0.5 transition-all duration-300">
            <span className="relative z-10">Voir mes projets</span>
            <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out" />
          </button>
          <button className="group relative px-8 py-3.5 rounded-full font-semibold text-base border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-warm-orange dark:hover:border-warm-orange-light hover:text-warm-orange dark:hover:text-warm-orange-light hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-slate-800 transition-all duration-300">
            Me contacter
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-[1200ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-6 h-6 border-l-2 border-b-2 border-slate-400 dark:border-slate-500 rotate-[-45deg] animate-bounce-arrow" />
          <span className="text-xs text-slate-500 dark:text-slate-600 uppercase tracking-wider font-medium">
            Défiler
          </span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
