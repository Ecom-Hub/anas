import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function PhoneFormatter() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length) setColumn(headers.find((h) => /phone|mobile|cell/i.test(h)) || headers[0]) }, [headers])

  const process = () => {
    const out = rows.map((r) => {
      let digits = String(r[column] ?? '').replace(/\D/g, '')
      if (digits && !String(r[column]).trim().startsWith('+')) {
        digits = countryCode.replace('+', '') + digits.replace(new RegExp(`^${countryCode.replace('+', '')}`), '')
      }
      const normalized = digits ? `+${digits}` : ''
      return { ...r, [column]: normalized }
    })
    setResult({ rows: out })
  }

  return (
    <div className="tool-body">
      <MultiFilePicker id="phone-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} />

      {headers.length > 0 && (
        <>
          <div className="row" style={{ marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Phone column</label>
              <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div style={{ width: 120 }}>
              <label className="label">Default country code</label>
              <input className="field" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="+1" />
            </div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Normalize numbers</button>
          </div>
          <div className="hint-text">Numbers without a leading + get the default country code applied. Result format: +&lt;digits&gt;.</div>
        </>
      )}

      {result && (
        <>
          <SheetPreview headers={headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`phones-formatted.${format}`, exportTabular(headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
