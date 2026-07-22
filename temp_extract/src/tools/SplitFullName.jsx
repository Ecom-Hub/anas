import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function SplitFullName() {
  const { files, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length) setColumn(headers.find((h) => /name/i.test(h)) || headers[0]) }, [headers])

  const process = () => {
    const newHeaders = [...headers, 'first_name', 'last_name']
    const out = rows.map((r) => {
      const parts = String(r[column] ?? '').trim().split(/\s+/)
      const first = parts[0] || ''
      const last = parts.slice(1).join(' ')
      return { ...r, first_name: first, last_name: last }
    })
    setResult({ headers: newHeaders, rows: out })
  }

  return (
    <div className="tool-body">
      <MultiFilePicker id="splitname-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Full name column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Split into first / last name</button>
          </div>
        </>
      )}

      {result && (
        <>
          <SheetPreview headers={result.headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`split-name.${format}`, exportTabular(result.headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
