import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

const toTitle = (s) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase())

export default function CaseNormalizer() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [mode, setMode] = useState('lower')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length && !column) setColumn(headers[0]) }, [headers])

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
      <MultiFilePicker id="case-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} />

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
