import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { downloadBlob, readAsDataURL, formatBytes } from './utils'

export default function ImagesToPdf() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFiles = (list) => {
    setFiles(Array.from(list))
    setError('')
  }

  const build = async () => {
    if (!files.length) return
    setBusy(true); setError('')
    try {
      const doc = new jsPDF({ unit: 'px' })
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await readAsDataURL(files[i])
        const img = new Image()
        await new Promise((res) => { img.onload = res; img.src = dataUrl })
        const pageW = doc.internal.pageSize.getWidth()
        const pageH = doc.internal.pageSize.getHeight()
        const ratio = Math.min(pageW / img.width, pageH / img.height)
        const w = img.width * ratio, h = img.height * ratio
        if (i > 0) doc.addPage()
        doc.addImage(dataUrl, 'JPEG', (pageW - w) / 2, (pageH - h) / 2, w, h)
      }
      downloadBlob('images.pdf', doc.output('blob'))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('img2pdf-input').click()}>
        <p>{files.length ? `${files.length} image(s) selected` : 'Click to choose images (JPG, PNG)'}</p>
      </div>
      <input id="img2pdf-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => <div key={i}><span>{f.name}</span><span>{formatBytes(f.size)}</span></div>)}
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!files.length || busy} onClick={build}>
          {busy ? <span className="spinner" /> : `Build PDF from ${files.length || 0} image(s)`}
        </button>
      </div>
    </div>
  )
}
