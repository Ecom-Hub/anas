import { useState } from 'react'
import { parseTabular, exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'

const TARGETS = ['first_name', 'last_name', 'email', 'company', 'title', 'linkedin_url', 'phone', 'custom1', 'custom2']

function guessMatch(target, headers) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '')
  const t = norm(target)
  return headers.find((h) => norm(h) === t || norm(h).includes(t) || t.includes(norm(h))) || ''
}

export default function OutreachColumnMapper() {
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [mapping, setMapping] = useState({})
  const [busy, setBusy] = useState(false)

  const onFile = async (file) => {
    setBusy(true)
    try {
      const { headers, rows } = await parseTabular(file)
      setHeaders(headers); setRows(rows)
      const guessed = {}
      TARGETS.forEach((t) => { guessed[t] = guessMatch(t, headers) })
      setMapping(guessed)
    } finally { setBusy(false) }
  }

  const activeTargets = TARGETS.filter((t) => mapping[t])
  const mappedRows = rows.map((r) => {
    const out = {}
    activeTargets.forEach((t) => { out[t] = r[mapping[t]] ?? '' })
    return out
  })

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('mapper-input').click()}>
        <p>{busy ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> : 'Click to choose your outreach sheet (CSV or Excel)'}</p>
      </div>
      <input id="mapper-input" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {headers.length > 0 && (
        <>
          <div className="hint-text" style={{ marginTop: 10 }}>Matched columns automatically where possible — check and adjust before exporting.</div>
          {TARGETS.map((t) => (
            <div className="row" key={t} style={{ marginTop: 10, alignItems: 'center' }}>
              <div style={{ width: 110, fontSize: 13, fontWeight: 600 }}>{t}</div>
              <select className="field" style={{ flex: 1 }} value={mapping[t] || ''} onChange={(e) => setMapping((m) => ({ ...m, [t]: e.target.value }))}>
                <option value="">— skip —</option>
                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          ))}

          <SheetPreview headers={activeTargets} rows={mappedRows} />

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={!activeTargets.length} onClick={() => downloadBlob('outreach-ready.csv', exportTabular(activeTargets, mappedRows, 'csv'))}>Download CSV (ready for PlusVibe / Instantly)</button>
          </div>
        </>
      )}
    </div>
  )
}
