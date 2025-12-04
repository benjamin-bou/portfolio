import Header from './components/Header'
import HeroSection from './components/HeroSection'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        {/* Sections à venir */}
        <div id="about" className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">À propos (à venir)</h2>
        </div>
        <div id="projects" className="min-h-screen bg-white dark:bg-corporate-dark flex items-center justify-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Projets (à venir)</h2>
        </div>
        <div id="contact" className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Contact (à venir)</h2>
        </div>
      </main>
    </>
  )
}

export default App
