import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function PhoneFormatter() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [column, setColumn] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')
  const [result, setResult] = useState(null)

  const onFile = async (file) => {
    setBusy(true); setResult(null)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows); setColumn(headers.find((h) => /phone|mobile|cell/i.test(h)) || headers[0] || '')
      setFormat(file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally { setBusy(false) }
  }

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
      <div className="dropzone" onClick={() => document.getElementById('phone-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose a CSV or Excel file'}</p>
      </div>
      <input id="phone-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

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
