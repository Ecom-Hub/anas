import Reveal from '../hooks/Reveal'

export default function Contact() {
  return (
    <section id="contact" className="contact">
      <Reveal className="wrap">
        <p className="eyebrow" style={{ color: '#5aa9ff' }}>Contact</p>
        <h2>Let's build something that scales.</h2>
        <p className="lead">
          Open to connecting with business owners and founders looking to grow through automation
          and outreach.
        </p>
        <div className="contact-ctas">
          <a href="mailto:web.anasq@gmail.com" className="btn btn-primary">web.anasq@gmail.com</a>
          <a href="https://www.linkedin.com/in/anasqureshi" target="_blank" rel="noopener" className="btn btn-ghost invert">LinkedIn</a>
        </div>
      </Reveal>
    </section>
  )
}
