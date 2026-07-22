import { useEffect, useState } from 'react'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function SheetHealthCheck() {
  const { files, headers, rows, busy, addFiles, removeFile } = useMergedSheet()
  const [dupeCol, setDupeCol] = useState('')

  useEffect(() => { if (headers.length) setDupeCol(headers.find((h) => /email/i.test(h)) || headers[0]) }, [headers])

  const emptyCounts = headers.map((h) => ({
    header: h,
    empty: rows.filter((r) => String(r[h] ?? '').trim() === '').length,
  }))

  const dupeCount = dupeCol
    ? rows.length - new Set(rows.map((r) => String(r[dupeCol] ?? '').trim().toLowerCase()).filter(Boolean)).size
    : 0

  return (
    <div className="tool-body">
      <MultiFilePicker id="health-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} />

      {headers.length > 0 && (
        <>
          <div className="skillgrid" style={{ marginTop: 16, gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <div style={{ background: 'var(--bg-dim)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{rows.length}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Total rows{files.length > 1 ? ` (${files.length} files)` : ''}</div>
            </div>
            <div style={{ background: 'var(--bg-dim)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{headers.length}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Columns</div>
            </div>
            <div style={{ background: 'var(--bg-dim)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{dupeCount}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-dim)' }}>Duplicates in "{dupeCol}"</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="label">Check duplicates against column</label>
            <select className="field" value={dupeCol} onChange={(e) => setDupeCol(e.target.value)}>
              {headers.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="label" style={{ marginTop: 18 }}>Empty cells per column</div>
          <div className="file-list">
            {emptyCounts.map((c) => (
              <div key={c.header}><span>{c.header}</span><span>{c.empty} empty ({rows.length ? Math.round((c.empty / rows.length) * 100) : 0}%)</span></div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
