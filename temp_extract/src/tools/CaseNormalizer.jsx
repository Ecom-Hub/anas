import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

const toTitle = (s) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase())

export default function CaseNormalizer() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [column, setColumn] = useState('')
  const [mode, setMode] = useState('lower')
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')
  const [result, setResult] = useState(null)

  const onFile = async (file) => {
    setBusy(true); setResult(null)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows); setColumn(headers[0] || '')
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

  const process = () => {
    const out = rows.map((r) => {
      const v = String(r[column] ?? '')
      const nv = mode === 'lower' ? v.toLowerCase() : mode === 'upper' ? v.toUpperCase() : toTitle(v)
      return { ...r, [column]: nv }
    })
    setResult({ rows: out })
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('case-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="case-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div className="row" style={{ marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Column</label>
              <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Case</label>
              <select className="field" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="lower">lowercase</option>
                <option value="upper">UPPERCASE</option>
                <option value="title">Title Case</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Apply</button>
          </div>
        </>
      )}

      {result && (
        <>
          <SheetPreview headers={headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`normalized.${format}`, exportTabular(headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
