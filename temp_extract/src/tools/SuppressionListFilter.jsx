import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function SuppressionListFilter() {
  const [main, setMain] = useState(null)
  const [supp, setSupp] = useState(null)
  const [colMain, setColMain] = useState('')
  const [colSupp, setColSupp] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const onMain = async (file) => {
    setBusy(true)
    try { const p = await parseTabular(file); setMain(p); setColMain(p.headers.find((h) => /email/i.test(h)) || p.headers[0] || '') } finally { setBusy(false) }
  }
  const onSupp = async (file) => {
    setBusy(true)
    try { const p = await parseTabular(file); setSupp(p); setColSupp(p.headers.find((h) => /email/i.test(h)) || p.headers[0] || '') } finally { setBusy(false) }
  }

  const process = () => {
    const blocked = new Set(supp.rows.map((r) => String(r[colSupp] ?? '').trim().toLowerCase()))
    const clean = main.rows.filter((r) => !blocked.has(String(r[colMain] ?? '').trim().toLowerCase()))
    setResult({ clean, removed: main.rows.length - clean.length })
  }

  return (
    <div className="tool-body">
      <label className="label">Your list</label>
      <div className="dropzone" onClick={() => document.getElementById('supp-main').click()}>
        <p>{main ? `Loaded ${main.rows.length} rows` : 'Click to choose your list'}</p>
      </div>
      <input id="supp-main" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onMain(e.target.files[0])} />
      {main && (
        <select className="field" style={{ marginTop: 8 }} value={colMain} onChange={(e) => setColMain(e.target.value)}>
          {main.headers.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      )}

      <label className="label" style={{ marginTop: 18 }}>Suppression / blacklist file</label>
      <div className="dropzone" onClick={() => document.getElementById('supp-list').click()}>
        <p>{supp ? `Loaded ${supp.rows.length} rows` : 'Click to choose suppression list'}</p>
      </div>
      <input id="supp-list" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onSupp(e.target.files[0])} />
      {supp && (
        <select className="field" style={{ marginTop: 8 }} value={colSupp} onChange={(e) => setColSupp(e.target.value)}>
          {supp.headers.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      )}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!main || !supp || busy} onClick={process}>Remove suppressed rows</button>
      </div>

      {result && (
        <>
          <div className="hint-text">Removed {result.removed} row(s) found in the suppression list.</div>
          <SheetPreview headers={main.headers} rows={result.clean} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob('suppressed-cleaned.csv', exportTabular(main.headers, result.clean, 'csv'))}>Download CSV</button>
          </div>
        </>
      )}
    </div>
  )
}
