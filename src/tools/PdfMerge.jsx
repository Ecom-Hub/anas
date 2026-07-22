import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { downloadBlob, formatBytes, readAsArrayBuffer } from './utils'

export default function PdfMerge() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFiles = (list) => setFiles((prev) => [...prev, ...Array.from(list)])
  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const move = (i, dir) => {
    setFiles((prev) => {
      const arr = [...prev]
      const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  const merge = async () => {
    if (files.length < 2) return
    setBusy(true); setError('')
    try {
      const merged = await PDFDocument.create()
      for (const file of files) {
        const buf = await readAsArrayBuffer(file)
        const src = await PDFDocument.load(buf)
        const pages = await merged.copyPages(src, src.getPageIndices())
        pages.forEach((p) => merged.addPage(p))
      }
      const bytes = await merged.save()
      downloadBlob('merged.pdf', bytes, 'application/pdf')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('merge-input').click()}>
        <p>Click to add PDFs (order matters — add in the order you want)</p>
      </div>
      <input id="merge-input" type="file" accept="application/pdf" multiple style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i}>
              <span>{i + 1}. {f.name} ({formatBytes(f.size)})</span>
              <span className="row" style={{ gap: 6 }}>
                <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => move(i, -1)}>↑</button>
                <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => move(i, 1)}>↓</button>
                <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => remove(i)}>✕</button>
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={files.length < 2 || busy} onClick={merge}>
          {busy ? <span className="spinner" /> : `Merge ${files.length} PDFs`}
        </button>
      </div>
    </div>
  )
}
