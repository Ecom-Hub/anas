import Reveal from '../hooks/Reveal'

export default function Hero() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">Growth Outreach &amp; Lead Generation</p>
        <h1>Outreach that runs<br />on a system, not<br />guesswork.</h1>
        <p className="lead">
          I'm Anas — based in Multan, Pakistan. I handle outreach and lead generation at
          Marketing by Prof, working closely with the automation and AI tooling that powers it.
        </p>
        <div className="hero-ctas">
          <a href="mailto:web.anasq@gmail.com" className="btn btn-primary">Get in touch</a>
          <a href="#pipeline" className="btn btn-ghost">See how it works</a>
        </div>
      </div>
      <Reveal className="photo-wrap">
        <div className="photo-fallback">AQ</div>
        <img src="profile.jpg" alt="Muhammad Anas Qureshi" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="photo-tag"><span className="dot"></span> Open to work</div>
      </Reveal>
    </section>
  )
}
