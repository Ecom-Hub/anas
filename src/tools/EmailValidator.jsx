import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailValidator() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length) setColumn(headers.find((h) => /email/i.test(h)) || headers[0]) }, [headers])

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
      <MultiFilePicker id="emailval-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} />

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
