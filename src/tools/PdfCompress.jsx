import { useState } from 'react'
import pdfjsLib from './pdfjsSetup'
import { jsPDF } from 'jspdf'
import { downloadBlob, formatBytes, readAsArrayBuffer } from './utils'

export default function PdfCompress() {
  const [file, setFile] = useState(null)
  const [quality, setQuality] = useState(0.6)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resultSize, setResultSize] = useState(0)

  const onFile = (f) => { setFile(f); setError(''); setResultSize(0) }

  const compress = async () => {
    if (!file) return
    setBusy(true); setError(''); setResultSize(0)
    try {
      const buf = await readAsArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      const scale = 0.75 + quality * 0.75 // ~0.75–1.5
      const jpegQuality = 0.35 + quality * 0.55 // ~0.35–0.9
      let outDoc
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
        const imgData = canvas.toDataURL('image/jpeg', jpegQuality)
        if (!outDoc) {
          outDoc = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] })
        } else {
          outDoc.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'l' : 'p')
        }
        outDoc.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
      }
      const blob = outDoc.output('blob')
      setResultSize(blob.size)
      downloadBlob('compressed.pdf', blob, 'application/pdf')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('pdfcompress-input').click()}>
        <p>{file ? file.name : 'Click to choose a PDF'}</p>
      </div>
      <input id="pdfcompress-input" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {file && (
        <>
          <div className="hint-text">Original: {formatBytes(file.size)}. Note: pages are converted to compressed images, so text stops being selectable — best for scanned or image-heavy PDFs.</div>
          <div style={{ marginTop: 14 }}>
            <label className="label">Quality: {Math.round(quality * 100)}%</label>
            <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </>
      )}

      {error && <div className="error-text">{error}</div>}
      {resultSize > 0 && <div className="hint-text">Result: {formatBytes(resultSize)}</div>}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!file || busy} onClick={compress}>
          {busy ? <span className="spinner" /> : 'Compress & download'}
        </button>
      </div>
    </div>
  )
}
