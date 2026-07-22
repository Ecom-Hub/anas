import Reveal from '../hooks/Reveal'

export default function About() {
  return (
    <section id="about">
      <div className="wrap about">
        <Reveal>
          <p className="eyebrow">About</p>
          <h2>From running my own shop to working inside a growth system.</h2>
        </Reveal>
        <Reveal className="about-copy">
          <p>
            Before outreach, I ran my own shop, managed Amazon operations remotely for a Canadian
            company, and handled e-commerce for a fast-moving startup. That gave me a real feel for
            how businesses operate day to day — inventory, customer service, the parts that don't
            show up on a landing page.
          </p>
          <p>
            Now, at Marketing by Prof, I focus on outreach: researching the right prospects, starting
            real conversations, and connecting businesses with automation that actually saves them
            time. I work closely with the automation and API tooling behind that outreach — enough to
            be comfortable in the tools myself, even though I'm not the one building the pipelines
            from scratch.
          </p>
          <div className="quote-card" style={{ marginTop: 24 }}>
            <p>"I'd rather learn the system than repeat the task a thousand times."</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
