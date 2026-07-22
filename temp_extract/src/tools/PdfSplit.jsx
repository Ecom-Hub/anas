import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { downloadBlob, readAsArrayBuffer } from './utils'

export default function PdfSplit() {
  const [fileName, setFileName] = useState('')
  const [numPages, setNumPages] = useState(0)
  const [buffer, setBuffer] = useState(null)
  const [range, setRange] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFile = async (file) => {
    setError(''); setFileName(file.name)
    const buf = await readAsArrayBuffer(file)
    setBuffer(buf)
    const src = await PDFDocument.load(buf)
    setNumPages(src.getPageCount())
  }

  const parseRange = (str, max) => {
    const pages = new Set()
    str.split(',').forEach((part) => {
      const p = part.trim()
      if (!p) return
      if (p.includes('-')) {
        const [a, b] = p.split('-').map((n) => parseInt(n.trim(), 10))
        for (let i = a; i <= b; i++) if (i >= 1 && i <= max) pages.add(i - 1)
      } else {
        const n = parseInt(p, 10)
        if (n >= 1 && n <= max) pages.add(n - 1)
      }
    })
    return Array.from(pages).sort((a, b) => a - b)
  }

  const split = async () => {
    setBusy(true); setError('')
    try {
      const indices = parseRange(range, numPages)
      if (!indices.length) throw new Error('Enter a valid page range, e.g. 1-3,5')
      const src = await PDFDocument.load(buffer)
      const out = await PDFDocument.create()
      const pages = await out.copyPages(src, indices)
      pages.forEach((p) => out.addPage(p))
      const bytes = await out.save()
      downloadBlob('split.pdf', bytes, 'application/pdf')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('split-input').click()}>
        <p>{fileName || 'Click to choose a PDF'}</p>
      </div>
      <input id="split-input" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {numPages > 0 && (
        <>
          <div className="hint-text">{numPages} page(s) total.</div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Pages to extract (e.g. 1-3,5)</label>
            <input className="field" value={range} onChange={(e) => setRange(e.target.value)} placeholder={`1-${numPages}`} />
          </div>
        </>
      )}

      {error && <div className="error-text">{error}</div>}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!numPages || busy} onClick={split}>
          {busy ? <span className="spinner" /> : 'Extract pages'}
        </button>
      </div>
    </div>
  )
}
