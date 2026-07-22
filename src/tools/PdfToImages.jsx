import { useState } from 'react'
import pdfjsLib from './pdfjsSetup'
import { downloadBlob, readAsArrayBuffer } from './utils'

export default function PdfToImages() {
  const [fileName, setFileName] = useState('')
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFile = async (file) => {
    setBusy(true); setError(''); setImages([]); setFileName(file.name)
    try {
      const buf = await readAsArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      const out = []
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
        out.push(canvas.toDataURL('image/png'))
      }
      setImages(out)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('pdf2img-input').click()}>
        <p>{fileName || 'Click to choose a PDF'}</p>
      </div>
      <input id="pdf2img-input" type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {busy && <div className="hint-text">Rendering pages…</div>}
      {error && <div className="error-text">{error}</div>}

      {images.length > 0 && (
        <>
          <div className="hint-text">{images.length} page(s) rendered.</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={() => images.forEach((img, i) => {
              fetch(img).then(r => r.blob()).then(b => downloadBlob(`page-${i + 1}.png`, b))
            })}>Download all as PNG</button>
          </div>
        </>
      )}
    </div>
  )
}
