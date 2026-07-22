import { useEffect, useState } from 'react'

const links = [
  { href: '#about', label: 'About' },
  { href: '#pipeline', label: 'How I Work' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#tools', label: 'Free Tools' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`mainnav ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">MA.</div>
      <div className="navlinks">
        {links.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </div>
      <a href="#contact" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
        Get in touch
      </a>
    </nav>
  )
}
