import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function ExtractDomain() {
  const { files, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length) setColumn(headers.find((h) => /email/i.test(h)) || headers[0]) }, [headers])

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
      <MultiFilePicker id="domain-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} />

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
