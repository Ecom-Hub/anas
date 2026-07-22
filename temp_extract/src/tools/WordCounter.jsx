import { useMemo, useState } from 'react'

export default function WordCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0
    const readingMins = Math.max(1, Math.ceil(words / 200))
    return { words, chars, charsNoSpace, sentences, paragraphs, readingMins }
  }, [text])

  const items = [
    ['Words', stats.words],
    ['Characters', stats.chars],
    ['Characters (no spaces)', stats.charsNoSpace],
    ['Sentences', stats.sentences],
    ['Paragraphs', stats.paragraphs],
    ['Reading time', `~${stats.readingMins} min`],
  ]

  return (
    <div className="tool-body">
      <label className="label">Text</label>
      <textarea className="field" style={{ minHeight: 160 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type text…" />
      <div className="skillgrid" style={{ marginTop: 16, gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {items.map(([label, val]) => (
          <div key={label} style={{ background: 'var(--bg-dim)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--line)' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
