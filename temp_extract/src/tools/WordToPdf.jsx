import { useRef, useState } from 'react'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { downloadBlob, readAsArrayBuffer } from './utils'

export default function WordToPdf() {
  const [html, setHtml] = useState('')
  const [fileName, setFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const previewRef = useRef(null)

  const onFile = async (file) => {
    setError(''); setHtml(''); setFileName(file.name)
    try {
      const buf = await readAsArrayBuffer(file)
      const result = await mammoth.convertToHtml({ arrayBuffer: buf })
      setHtml(result.value)
    } catch (e) {
      setError(e.message)
    }
  }

  const build = async () => {
    setBusy(true)
    try {
      const el = previewRef.current
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({ unit: 'px', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width
      let heightLeft = imgH
      let position = 0
      pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH)
      heightLeft -= pageH
      while (heightLeft > 0) {
        position = heightLeft - imgH
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH)
        heightLeft -= pageH
      }
      downloadBlob('converted.pdf', pdf.output('blob'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('docx-input').click()}>
        <p>{fileName || 'Click to choose a .docx file'}</p>
      </div>
      <input id="docx-input" type="file" accept=".docx" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {error && <div className="error-text">{error}</div>}
      {html && <div className="hint-text">Document loaded — layout is approximated, best for text-heavy docs.</div>}

      {html && (
        <div ref={previewRef} style={{ padding: 32, background: '#fff', width: 600, fontFamily: 'Georgia, serif', color: '#111', position: 'absolute', left: -9999, top: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
      )}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!html || busy} onClick={build}>
          {busy ? <span className="spinner" /> : 'Convert to PDF'}
        </button>
      </div>
    </div>
  )
}
