import { useState } from 'react'

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true })
  const [password, setPassword] = useState('')

  const toggle = (k) => setOpts((o) => ({ ...o, [k]: !o[k] }))

  const generate = () => {
    const pool = Object.keys(opts).filter((k) => opts[k]).map((k) => SETS[k]).join('')
    if (!pool) return
    const bytes = new Uint32Array(length)
    crypto.getRandomValues(bytes)
    let out = ''
    for (let i = 0; i < length; i++) out += pool[bytes[i] % pool.length]
    setPassword(out)
  }

  return (
    <div className="tool-body">
      <label className="label">Length: {length}</label>
      <input type="range" min="6" max="48" value={length} onChange={(e) => setLength(Number(e.target.value))} style={{ width: '100%' }} />

      <div className="row" style={{ marginTop: 14 }}>
        {Object.keys(SETS).map((k) => (
          <label key={k} className="hint-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} /> {k}
          </label>
        ))}
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={generate}>Generate</button>
      </div>

      {password && (
        <>
          <div className="result-box" style={{ fontSize: 16, letterSpacing: 1 }}>{password}</div>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(password)}>Copy</button>
        </>
      )}
    </div>
  )
}
