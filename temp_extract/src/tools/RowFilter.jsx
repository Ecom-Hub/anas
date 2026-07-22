import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

const CONDITIONS = [
  { id: 'contains', label: 'contains' },
  { id: 'not_contains', label: 'does not contain' },
  { id: 'equals', label: 'equals' },
  { id: 'not_empty', label: 'is not empty' },
  { id: 'empty', label: 'is empty' },
]

export default function RowFilter() {
  const { files, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [condition, setCondition] = useState('contains')
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => { if (headers.length && !column) setColumn(headers[0]) }, [headers])

  const matches = (val) => {
    const v = String(val ?? '')
    switch (condition) {
      case 'contains': return v.toLowerCase().includes(value.toLowerCase())
      case 'not_contains': return !v.toLowerCase().includes(value.toLowerCase())
      case 'equals': return v.toLowerCase() === value.toLowerCase()
      case 'not_empty': return v.trim() !== ''
      case 'empty': return v.trim() === ''
      default: return true
    }
  }

  const process = () => setResult({ rows: rows.filter((r) => matches(r[column])) })

  const needsValue = condition === 'contains' || condition === 'not_contains' || condition === 'equals'

  return (
    <div className="tool-body">
      <MultiFilePicker id="filter-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} />

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
              <label className="label">Condition</label>
              <select className="field" value={condition} onChange={(e) => setCondition(e.target.value)}>
                {CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          {needsValue && (
            <div style={{ marginTop: 14 }}>
              <label className="label">Value</label>
              <input className="field" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Founder" />
            </div>
          )}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={process}>Apply filter — keep matching rows</button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className="hint-text">{result.rows.length} of {rows.length} row(s) kept.</div>
          <SheetPreview headers={headers} rows={result.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`filtered.${format}`, exportTabular(headers, result.rows, format))}>Download {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
