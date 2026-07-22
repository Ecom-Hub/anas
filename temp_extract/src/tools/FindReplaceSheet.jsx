import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function FindReplaceSheet() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [column, setColumn] = useState('__all__')
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')
  const [result, setResult] = useState(null)

  const onFile = async (file) => {
    setBusy(true); setResult(null)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows)
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

  const process = () => {
    if (!find) return
    const cols = column === '__all__' ? headers : [column]
    let count = 0
    const out = rows.map((r) => {
      const nr = { ...r }
      cols.forEach((c) => {
        const val = String(nr[c] ?? '')
        if (val.includes(find)) {
          count += val.split(find).length - 1
          nr[c] = val.split(find).join(replace)
        }
      })
      return nr
    })
    setResult({ rows: out, count })
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('findreplace-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="findreplace-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              <option value="__all__">All columns</option>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Find</label>
              <input className="field" value={find} onChange={(e) => setFind(e.target.value)} placeholder="Inc." />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label">Replace with</label>
              <input className="field" value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="(leave empty to remove)" />
            </div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={!find} onClick={process}>Find & replace</button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className="hint-text">{result.count} replacement(s) made.</div>
          <SheetPreview headers={headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`replaced.${format}`, exportTabular(headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
