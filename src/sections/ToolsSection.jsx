import { Suspense, useState } from 'react'
import Reveal from '../hooks/Reveal'
import { categories, tools } from '../tools/registry'

function Modal({ tool, onClose }) {
  if (!tool) return null
  const ToolComponent = tool.component
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-title">{tool.name}</div>
        <div className="modal-sub">{tool.desc}</div>
        <Suspense fallback={<div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--ink-dim)', fontSize: 14 }}>Loading tool…</div>}>
          <ToolComponent />
        </Suspense>
      </div>
    </div>
  )
}

export default function ToolsSection() {
  const [activeCat, setActiveCat] = useState('File Conversion')
  const [openTool, setOpenTool] = useState(null)

  const visible = tools.filter((t) => t.category === activeCat)

  return (
    <section id="tools" className="tools-section">
      <div className="wrap">
        <Reveal><p className="eyebrow">Free Tools</p></Reveal>
        <Reveal><h2>Practical tools, running right in your browser.</h2></Reveal>
        <Reveal as="p">
          Nothing here uploads your files to a server — conversions happen locally on your device.
        </Reveal>

        <div className="tool-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={`tool-tab ${activeCat === c ? 'active' : ''}`}
              onClick={() => setActiveCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="tool-grid">
          {visible.map((t) => (
            <Reveal as="button" className="tool-card" key={t.id} onClick={() => setOpenTool(t)}>
              <div className="tool-icon">{t.icon}</div>
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
              {t.badge && <span className="tool-badge">{t.badge}</span>}
            </Reveal>
          ))}
        </div>
      </div>

      <Modal tool={openTool} onClose={() => setOpenTool(null)} />
    </section>
  )
}
