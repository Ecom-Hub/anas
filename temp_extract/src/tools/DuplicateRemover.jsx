import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function DuplicateRemover() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [column, setColumn] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [format, setFormat] = useState('csv')

  const onFile = async (file) => {
    setBusy(true); setResult(null)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows); setColumn(headers[0] || '')
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

  const process = () => {
    const seen = new Set()
    const clean = []
    for (const r of rows) {
      const key = String(r[column] ?? '').trim().toLowerCase()
      if (!key || !seen.has(key)) { if (key) seen.add(key); clean.push(r) } 
    }
    setResult({ rows: clean, removed: rows.length - clean.length })
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('dup-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="dup-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Remove duplicates based on column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Find & remove duplicates</button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className="hint-text">Removed {result.removed} duplicate row(s). {result.rows.length} row(s) remain.</div>
          <SheetPreview headers={headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`deduped.${format}`, exportTabular(headers, result.rows, format))}>Download cleaned {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
