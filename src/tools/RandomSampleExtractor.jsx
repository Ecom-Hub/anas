import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function RandomSampleExtractor() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [n, setN] = useState(10)
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')
  const [result, setResult] = useState(null)

  const onFile = async (file) => {
    setBusy(true); setResult(null)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows)
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
      setN(Math.min(10, rows.length))
    } finally { setBusy(false) }
  }

  const process = () => {
    const shuffled = [...rows].sort(() => Math.random() - 0.5)
    setResult(shuffled.slice(0, n))
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('sample-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="sample-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Sample size (of {rows.length} rows)</label>
            <input className="field" type="number" min="1" max={rows.length} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Pull random sample</button>
          </div>
        </>
      )}

      {result && (
        <>
          <SheetPreview headers={headers} rows={result} max={result.length} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`sample-${n}.${format}`, exportTabular(headers, result, format))}>Download sample</button>
          </div>
        </>
      )}
    </div>
  )
}
