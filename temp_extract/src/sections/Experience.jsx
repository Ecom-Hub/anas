import Reveal from '../hooks/Reveal'

const roles = [
  {
    title: 'Growth Outreach Specialist',
    org: 'Marketing by Prof · Islamabad, PK',
    date: 'Nov 2025 — Present',
    desc: "Prospect research and personalized outreach to bring new clients into the agency's AI automation, paid ads, copywriting, and web design services. Heavy on CRM work and messaging strategy — every touchpoint built to feel relevant, not templated.",
  },
  {
    title: 'Ecommerce & Technical Consultant',
    org: 'Freelance / Remote',
    date: 'Mar 2023 — Present',
    desc: 'Keyword research and listing optimization for Amazon SEO, product hunting for private label launches, and technical systems support — diagnostics, deployment, and infrastructure upkeep for client operations.',
  },
  {
    title: 'Administrative Assistant',
    org: 'EMASS Services · Canada (Remote)',
    date: 'Aug 2021 — Feb 2023',
    desc: 'Full-cycle Amazon operations — customer inquiries, order processing, shipment tracking, and inventory accuracy. Replaced manual CRM entry with automated verification, cutting errors by 15%.',
  },
  {
    title: 'Administrator',
    org: 'Pure Gold Technologies (Pvt) Ltd',
    date: 'Sep 2019 — Mar 2021',
    desc: 'E-commerce operations and customer support at a small, fast-moving startup — inventory, complaints, social media, and marketing assets, often all in the same day.',
  },
]

export default function Experience() {
  return (
    <section id="experience">
      <div className="wrap">
        <Reveal><p className="eyebrow">Experience</p></Reveal>
        <Reveal><h2>Professional journey.</h2></Reveal>
        <div className="timeline" style={{ marginTop: 48 }}>
          {roles.map((r) => (
            <Reveal className="role" key={r.title + r.date}>
              <div className="role-top">
                <div>
                  <div className="role-title">{r.title}</div>
                  <div className="role-org">{r.org}</div>
                </div>
                <div className="role-date">{r.date}</div>
              </div>
              <p>{r.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
