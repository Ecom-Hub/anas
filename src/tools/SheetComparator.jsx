import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

export default function SheetComparator() {
  const [a, setA] = useState(null)
  const [b, setB] = useState(null)
  const [colA, setColA] = useState('')
  const [colB, setColB] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const onFileA = async (file) => {
    setBusy(true)
    try { const p = await parseTabular(file); setA(p); setColA(p.headers[0] || '') } finally { setBusy(false) }
  }
  const onFileB = async (file) => {
    setBusy(true)
    try { const p = await parseTabular(file); setB(p); setColB(p.headers[0] || '') } finally { setBusy(false) }
  }

  const compare = () => {
    const setB_ = new Set(b.rows.map((r) => String(r[colB] ?? '').trim().toLowerCase()))
    const onlyInA = a.rows.filter((r) => !setB_.has(String(r[colA] ?? '').trim().toLowerCase()))
    setResult(onlyInA)
  }

  return (
    <div className="tool-body">
      <label className="label">List A (e.g. your full contact list)</label>
      <div className="dropzone" onClick={() => document.getElementById('cmp-a').click()}>
        <p>{a ? `Loaded ${a.rows.length} rows` : 'Click to choose file A'}</p>
      </div>
      <input id="cmp-a" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFileA(e.target.files[0])} />
      {a && (
        <select className="field" style={{ marginTop: 8 }} value={colA} onChange={(e) => setColA(e.target.value)}>
          {a.headers.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      )}

      <label className="label" style={{ marginTop: 18 }}>List B (e.g. already contacted)</label>
      <div className="dropzone" onClick={() => document.getElementById('cmp-b').click()}>
        <p>{b ? `Loaded ${b.rows.length} rows` : 'Click to choose file B'}</p>
      </div>
      <input id="cmp-b" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFileB(e.target.files[0])} />
      {b && (
        <select className="field" style={{ marginTop: 8 }} value={colB} onChange={(e) => setColB(e.target.value)}>
          {b.headers.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      )}

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" disabled={!a || !b || busy} onClick={compare}>Find rows in A not in B</button>
      </div>

      {result && (
        <>
          <div className="hint-text">{result.length} row(s) in A are not in B.</div>
          <SheetPreview headers={a.headers} rows={result} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob('only-in-a.csv', exportTabular(a.headers, result, 'csv'))}>Download CSV</button>
          </div>
        </>
      )}
    </div>
  )
}
