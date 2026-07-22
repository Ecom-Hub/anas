import Reveal from '../hooks/Reveal'

const groups = [
  { title: 'Outreach & CRM', pills: ['Prospect research', 'Personalized messaging', 'CRM management', 'Lead generation'] },
  { title: 'Automation & Tech', pills: ['APIs', 'AI tooling', 'Automation pipelines', 'Cloud infrastructure', 'Scripting', 'Git & GitHub'] },
  { title: 'E-commerce & Ops', pills: ['Amazon FBA & SEO', 'Inventory forecasting', 'LLC & LTD formation', 'Account health'] },
]

export default function Skills() {
  return (
    <section id="skills" style={{ background: 'var(--bg-dim)' }}>
      <div className="wrap">
        <Reveal><p className="eyebrow">Skills</p></Reveal>
        <Reveal><h2>What I work with.</h2></Reveal>
        <div className="skillgrid" style={{ marginTop: 40 }}>
          {groups.map((g) => (
            <Reveal className="skillcard" key={g.title}>
              <h3>{g.title}</h3>
              <div className="pill-row">
                {g.pills.map((p) => <span className="pill" key={p}>{p}</span>)}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" style={{ marginTop: 36, fontSize: 14 }}>
          BS Computer Science — The Islamia University of Bahawalpur
        </Reveal>
      </div>
    </section>
  )
}
