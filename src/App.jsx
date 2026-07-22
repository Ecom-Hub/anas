import Nav from './sections/Nav'
import Hero from './sections/Hero'
import Stats from './sections/Stats'
import About from './sections/About'
import Pipeline from './sections/Pipeline'
import Experience from './sections/Experience'
import Skills from './sections/Skills'
import ToolsSection from './sections/ToolsSection'
import Contact from './sections/Contact'

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Stats />
      <About />
      <Pipeline />
      <Experience />
      <Skills />
      <ToolsSection />
      <Contact />
      <footer className="sitefoot">© 2026 Muhammad Anas Qureshi · Multan, Punjab, Pakistan</footer>
    </>
  )
}
