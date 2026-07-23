import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function DuplicateRemover() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length && !column) setColumn(headers[0]) }, [headers])

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
      <MultiFilePicker id="dup-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Remove duplicates based on column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="hint-text">{files.length > 1 ? `${files.length} files combined — ${rows.length} rows total.` : `${rows.length} rows.`}</div>
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
