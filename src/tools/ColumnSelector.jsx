import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function ColumnSelector() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState([])
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')

  const onFile = async (file) => {
    setBusy(true)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows); setSelected(headers)
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

  const toggle = (h) => setSelected((s) => s.includes(h) ? s.filter((x) => x !== h) : [...s, h])

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('colsel-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="colsel-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <label className="label" style={{ marginTop: 14 }}>Columns to keep</label>
          <div className="pill-row">
            {headers.map((h) => (
              <span key={h} className="pill" style={{ cursor: 'pointer', background: selected.includes(h) ? 'var(--accent-dim)' : 'var(--bg-dim)', borderColor: selected.includes(h) ? 'var(--accent)' : 'var(--line)' }} onClick={() => toggle(h)}>
                {selected.includes(h) ? '✓ ' : ''}{h}
              </span>
            ))}
          </div>
          <SheetPreview headers={selected} rows={rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={!selected.length} onClick={() => downloadBlob(`trimmed.${format}`, exportTabular(selected, rows, format))}>Download {selected.length} column(s)</button>
          </div>
        </>
      )}
    </div>
  )
}
