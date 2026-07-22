import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

function cleanUrl(raw) {
  let v = String(raw ?? '').trim()
  if (!v) return ''
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v
  try {
    const u = new URL(v)
    const path = u.pathname.replace(/\/+$/, '')
    return `https://www.linkedin.com${path}`
  } catch {
    return v
  }
}

export default function LinkedInUrlCleaner() {
  const { files, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length) setColumn(headers.find((h) => /linkedin/i.test(h)) || headers[0]) }, [headers])

  const process = () => setResult({ rows: rows.map((r) => ({ ...r, [column]: cleanUrl(r[column]) })) })

  return (
    <div className="tool-body">
      <MultiFilePicker id="li-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} />

      {headers.length > 0 && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">LinkedIn URL column</label>
            <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Clean URLs</button>
          </div>
          <div className="hint-text">Strips tracking parameters and normalizes to https://www.linkedin.com/...</div>
        </>
      )}

      {result && (
        <>
          <SheetPreview headers={headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`linkedin-cleaned.${format}`, exportTabular(headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
