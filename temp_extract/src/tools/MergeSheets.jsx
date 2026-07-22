import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function MergeSheets() {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [format, setFormat] = useState('csv')

  const onFiles = (list) => setFiles((prev) => [...prev, ...Array.from(list)])
  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const merge = async () => {
    if (files.length < 2) return
    setBusy(true); setResult(null)
    try {
      const parsed = await Promise.all(files.map(parseTabular))
      const headerSet = new Set()
      parsed.forEach((p) => p.headers.forEach((h) => headerSet.add(h)))
      const headers = Array.from(headerSet)
      const rows = parsed.flatMap((p) => p.rows)
      setResult({ headers, rows })
      setFormat(files[0].name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('merge-sheets-input').click()}>
        <p>Click to add CSV/Excel files (2 or more)</p>
      </div>
      <input id="merge-sheets-input" type="file" accept=".csv,.xlsx,.xls" multiple style={{ display: 'none' }} onChange={(e) => onFiles(e.target.files)} />

      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => <div key={i}><span>{f.name}</span><button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => remove(i)}>✕</button></div>)}
        </div>
      )}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={files.length < 2 || busy} onClick={merge}>
          {busy ? <span className="spinner" /> : `Merge ${files.length} files`}
        </button>
      </div>

      {result && (
        <>
          <div className="hint-text">Combined into {result.rows.length} rows, {result.headers.length} columns. Columns are matched by header name — different names won't auto-merge.</div>
          <SheetPreview headers={result.headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`merged.${format}`, exportTabular(result.headers, result.rows, format))}>Download merged {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
