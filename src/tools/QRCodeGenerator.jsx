import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { downloadBlob } from './utils'

export default function QRCodeGenerator() {
  const [text, setText] = useState('https://example.com')
  const [size, setSize] = useState(256)
  const [dark, setDark] = useState('#111111')
  const [light, setLight] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      if (!text.trim()) {
        setDataUrl('')
        return
      }

      setBusy(true)
      setError('')
      try {
        const url = await QRCode.toDataURL(text.trim(), {
          width: size,
          margin: 1,
          color: {
            dark,
            light,
          },
        })
        if (!cancelled) setDataUrl(url)
      } catch (e) {
        if (!cancelled) setError('Could not generate QR code: ' + e.message)
      } finally {
        if (!cancelled) setBusy(false)
      }
    }

    render()
    return () => { cancelled = true }
  }, [text, size, dark, light])

  return (
    <div className="tool-body">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label className="label">Text or URL</label>
          <textarea className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="https://your-site.com" />
        </div>
        <div style={{ width: 160 }}>
          <label className="label">Size</label>
          <input className="field" type="number" min="128" max="1024" step="32" value={size} onChange={(e) => setSize(Number(e.target.value) || 256)} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label className="label">Foreground</label>
          <input className="field" type="color" value={dark} onChange={(e) => setDark(e.target.value)} style={{ height: 48, padding: 6 }} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label className="label">Background</label>
          <input className="field" type="color" value={light} onChange={(e) => setLight(e.target.value)} style={{ height: 48, padding: 6 }} />
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!dataUrl || busy} onClick={() => fetch(dataUrl).then((response) => response.blob()).then((blob) => downloadBlob('qr-code.png', blob))}>Download PNG</button>
      </div>

      {busy && <div className="hint-text">Generating QR code…</div>}
      {error && <div className="error-text">{error}</div>}

      {dataUrl && !error && (
        <div style={{ marginTop: 18, display: 'inline-flex', padding: 16, border: '1px solid var(--line)', borderRadius: 16, background: '#fff' }}>
          <img src={dataUrl} alt="QR code preview" style={{ width: size, height: size, display: 'block' }} />
        </div>
      )}
    </div>
  )
}