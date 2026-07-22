import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailValidator() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [column, setColumn] = useState('')
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')
  const [result, setResult] = useState(null)

  const onFile = async (file) => {
    setBusy(true); setResult(null)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows); setColumn(headers.find((h) => /email/i.test(h)) || headers[0] || '')
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

  const process = () => {
    let valid = 0, invalid = 0
    const clean = []
    rows.forEach((r) => {
      const val = String(r[column] ?? '').trim()
      if (EMAIL_RE.test(val)) { valid++; clean.push({ ...r, [column]: val.toLowerCase() }) }
      else invalid++
    })
    setResult({ clean, valid, invalid })
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('emailval-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="emailval-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Email column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Validate & clean</button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className="hint-text">{result.valid} valid, {result.invalid} invalid (removed), emails lowercased and trimmed.</div>
          <SheetPreview headers={headers} rows={result.clean} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`emails-cleaned.${format}`, exportTabular(headers, result.clean, format))}>Download cleaned {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
