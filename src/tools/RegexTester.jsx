import { useMemo, useState } from 'react'

export default function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const matches = useMemo(() => {
    setError('')
    if (!pattern) return []
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      return Array.from(text.matchAll(re)).map((m) => ({ match: m[0], index: m.index, groups: m.slice(1) }))
    } catch (e) {
      setError(e.message)
      return []
    }
  }, [pattern, flags, text])

  return (
    <div className="tool-body">
      <div className="row">
        <div style={{ flex: 1 }}>
          <label className="label">Pattern</label>
          <input className="field" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\\b[\\w.-]+@[\\w.-]+\\.\\w+\\b" />
        </div>
        <div style={{ width: 100 }}>
          <label className="label">Flags</label>
          <input className="field" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gi" />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <label className="label">Test text</label>
        <textarea className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste sample text here…" />
      </div>

      {error && <div className="error-text">{error}</div>}
      {!error && pattern && (
        <div className="hint-text" style={{ marginTop: 10 }}>{matches.length} match{matches.length === 1 ? '' : 'es'}</div>
      )}
      {matches.length > 0 && (
        <div className="result-box">
          {matches.map((m, i) => `#${i + 1}: "${m.match}" at index ${m.index}${m.groups.length ? ` — groups: ${JSON.stringify(m.groups)}` : ''}`).join('\n')}
        </div>
      )}
    </div>
  )
}
