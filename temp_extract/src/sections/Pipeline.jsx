import { useEffect, useRef, useState } from 'react'
import Reveal from '../hooks/Reveal'

const stages = [
  {
    icon: '🔍', title: 'Research',
    short: 'Find the right prospects before writing a single message.',
    detail: 'Firmographic and contact data gets pulled from CRM and public sources, then scored against the campaign\'s ideal profile.',
  },
  {
    icon: '✍️', title: 'Personalize',
    short: 'Every message references something true about the prospect.',
    detail: 'An AI-assisted first pass drafts a first-touch message grounded in the prospect\'s actual context — never a templated blast.',
  },
  {
    icon: '📤', title: 'Send',
    short: 'Outreach ships on LinkedIn and email, on schedule.',
    detail: 'Messages go out on a schedule tuned per platform, with logging back into the CRM so nothing gets sent twice.',
  },
  {
    icon: '💬', title: 'Reply',
    short: 'Real replies get a real, fast response.',
    detail: 'Replies route straight to the outreach team with context attached, so a real conversation starts within minutes, not days.',
  },
  {
    icon: '🎯', title: 'Convert',
    short: 'Qualified conversations become client work.',
    detail: 'Qualified conversations get handed off with full context — the system\'s job ends where the deal begins.',
  },
]

export default function Pipeline() {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % stages.length)
    }, 3200)
    return () => clearInterval(timerRef.current)
  }, [])

  const pick = (i) => {
    clearInterval(timerRef.current)
    setActive(i)
  }

  return (
    <section id="pipeline" className="pipeline-section">
      <div className="wrap">
        <Reveal className="pipeline-head">
          <p className="eyebrow">How Outreach Runs</p>
          <h2>One lead, five stages, zero manual busywork.</h2>
          <p>Click a stage to see what actually happens at that step.</p>
        </Reveal>

        <div className="track">
          <div className="track-fill" style={{ width: `${((active + 1) / stages.length) * 100}%` }} />
        </div>

        <div className="pipeline">
          {stages.map((s, i) => (
            <div
              key={s.title}
              className={`stage ${active === i ? 'active' : ''}`}
              onClick={() => pick(i)}
            >
              <div className="stage-icon">{s.icon}</div>
              <div className="stage-index">0{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.short}</p>
            </div>
          ))}
        </div>

        <Reveal className="pipeline-detail">
          <span><b>0{active + 1} · {stages[active].title} —</b> {stages[active].detail}</span>
        </Reveal>
      </div>
    </section>
  )
}
