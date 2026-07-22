import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function RandomSampleExtractor() {
  const { files, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [n, setN] = useState(10)
  const [result, setResult] = useState(null)

  useEffect(() => { if (rows.length) setN((prev) => Math.min(prev || 10, rows.length)) }, [rows])

  const process = () => {
    const shuffled = [...rows].sort(() => Math.random() - 0.5)
    setResult(shuffled.slice(0, n))
  }

  return (
    <div className="tool-body">
      <MultiFilePicker id="sample-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} />

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
