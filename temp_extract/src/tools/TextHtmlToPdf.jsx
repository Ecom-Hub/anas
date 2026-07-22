import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { downloadBlob } from './utils'

export default function TextHtmlToPdf() {
  const [mode, setMode] = useState('text')
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const previewRef = useRef(null)

  const build = async () => {
    if (!content.trim()) return
    setBusy(true)
    try {
      const el = previewRef.current
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
      const img = canvas.toDataURL('image/jpeg', 0.95)
      const doc = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] })
      doc.addImage(img, 'JPEG', 0, 0, canvas.width, canvas.height)
      downloadBlob('document.pdf', doc.output('blob'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="row">
        <button className={`btn ${mode === 'text' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('text')}>Plain text</button>
        <button className={`btn ${mode === 'html' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('html')}>Simple HTML</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="label">{mode === 'text' ? 'Your text' : 'Your HTML'}</label>
        <textarea className="field" style={{ minHeight: 160 }} value={content} onChange={(e) => setContent(e.target.value)} placeholder={mode === 'text' ? 'Type or paste your text here…' : '<h1>Title</h1><p>Some text</p>'} />
      </div>

      <div
        ref={previewRef}
        style={{ padding: 32, background: '#fff', width: 600, maxWidth: '100%', position: 'absolute', left: -9999, top: 0, fontFamily: 'Georgia, serif', color: '#111' }}
      >
        {mode === 'text'
          ? content.split('\n').map((line, i) => <p key={i} style={{ margin: '0 0 10px' }}>{line}</p>)
          : <div dangerouslySetInnerHTML={{ __html: content }} />}
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!content.trim() || busy} onClick={build}>
          {busy ? <span className="spinner" /> : 'Generate PDF'}
        </button>
      </div>
    </div>
  )
}
