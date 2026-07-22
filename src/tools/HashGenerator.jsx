import { useState } from 'react'
import { md5 } from './md5'

async function sha(algo, text) {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, enc)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function HashGenerator() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState(null)
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    setBusy(true)
    try {
      const [sha1, sha256, sha512] = await Promise.all([
        sha('SHA-1', input), sha('SHA-256', input), sha('SHA-512', input),
      ])
      setHashes({ MD5: md5(input), 'SHA-1': sha1, 'SHA-256': sha256, 'SHA-512': sha512 })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <label className="label">Text</label>
      <textarea className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste text to hash…" />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!input || busy} onClick={generate}>
          {busy ? <span className="spinner" /> : 'Generate hashes'}
        </button>
      </div>
      {hashes && (
        <div style={{ marginTop: 16 }}>
          {Object.entries(hashes).map(([algo, val]) => (
            <div key={algo} style={{ marginBottom: 10 }}>
              <div className="label">{algo}</div>
              <div className="result-box" style={{ marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
