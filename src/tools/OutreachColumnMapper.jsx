import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

const DEFAULT_TARGETS = ['first_name', 'last_name', 'email', 'company', 'title', 'linkedin_url', 'phone']

function guessMatch(target, headers) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '')
  const t = norm(target)
  return headers.find((h) => norm(h) === t || norm(h).includes(t) || t.includes(norm(h))) || ''
}

let uid = 0
const nextId = () => `f${uid++}`

export default function OutreachColumnMapper() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, addFiles, removeFile } = useMergedSheet()
  // fields: [{ id, target, source }]
  const [fields, setFields] = useState([])

  useEffect(() => {
    if (!headers.length) return
    setFields(DEFAULT_TARGETS.map((t) => ({ id: nextId(), target: t, source: guessMatch(t, headers) })))
  }, [headers])

  const updateField = (id, patch) => setFields((f) => f.map((x) => x.id === id ? { ...x, ...patch } : x))
  const addField = () => setFields((f) => [...f, { id: nextId(), target: '', source: '' }])
  const removeField = (id) => setFields((f) => f.filter((x) => x.id !== id))

  const activeFields = fields.filter((f) => f.target.trim() && f.source)
  const targetNames = activeFields.map((f) => f.target.trim())
  const mappedRows = rows.map((r) => {
    const out = {}
    activeFields.forEach((f) => { out[f.target.trim()] = r[f.source] ?? '' })
    return out
  })

  return (
    <div className="tool-body">
      <MultiFilePicker id="mapper-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} label="Click to add your outreach sheet(s) — CSV or Excel, combine as many as you need" />

      {headers.length > 0 && (
        <>
          <div className="hint-text" style={{ marginTop: 10 }}>
            Matched columns automatically where possible. Rename any target field, add as many custom columns as you need, and remove ones you don't.
          </div>

          {fields.map((f) => (
            <div className="row" key={f.id} style={{ marginTop: 10, alignItems: 'center' }}>
              <input
                className="field"
                style={{ width: 160 }}
                value={f.target}
                onChange={(e) => updateField(f.id, { target: e.target.value })}
                placeholder="column_name"
              />
              <select className="field" style={{ flex: 1 }} value={f.source} onChange={(e) => updateField(f.id, { source: e.target.value })}>
                <option value="">— select source column —</option>
                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
              <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => removeField(f.id)}>✕</button>
            </div>
          ))}

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={addField}>+ Add another column</button>
          </div>

          <SheetPreview headers={targetNames} rows={mappedRows} />

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={!activeFields.length} onClick={() => downloadBlob('outreach-ready.csv', exportTabular(targetNames, mappedRows, 'csv'))}>Download CSV (ready for PlusVibe / Instantly)</button>
          </div>
        </>
      )}
    </div>
  )
}
