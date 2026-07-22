import Reveal from '../hooks/Reveal'

const stats = [
  { num: '5+', label: 'Years in e-commerce & ops' },
  { num: '9', label: 'Months in outreach & lead gen at Marketing by Prof' },
  { num: 'Multiple', label: 'LLCs & LTDs formed end-to-end' },
  { num: '28', label: 'Free tools built right into this site' },
]

export default function Stats() {
  return (
    <section className="stats" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="wrap">
        {stats.map((s) => (
          <Reveal key={s.label}>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
