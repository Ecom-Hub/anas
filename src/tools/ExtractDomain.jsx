import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function ExtractDomain() {
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
    const newHeaders = [...headers, 'domain']
    const out = rows.map((r) => {
      const val = String(r[column] ?? '')
      const domain = val.includes('@') ? val.split('@')[1]?.trim() || '' : ''
      return { ...r, domain }
    })
    setResult({ headers: newHeaders, rows: out })
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('domain-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="domain-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Email column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Extract domain</button>
          </div>
        </>
      )}

      {result && (
        <>
          <SheetPreview headers={result.headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`with-domain.${format}`, exportTabular(result.headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
