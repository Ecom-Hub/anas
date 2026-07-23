import { useEffect, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function ColumnSelector() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()
  const [selected, setSelected] = useState([])

  useEffect(() => { setSelected(headers) }, [headers])

  const toggle = (h) => setSelected((s) => s.includes(h) ? s.filter((x) => x !== h) : [...s, h])

  return (
    <div className="tool-body">
      <MultiFilePicker id="colsel-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} />

      {headers.length > 0 && (
        <>
          <label className="label" style={{ marginTop: 14 }}>Columns to keep</label>
          <div className="pill-row">
            {headers.map((h) => (
              <span key={h} className="pill" style={{ cursor: 'pointer', background: selected.includes(h) ? 'var(--accent-dim)' : 'var(--bg-dim)', borderColor: selected.includes(h) ? 'var(--accent)' : 'var(--line)' }} onClick={() => toggle(h)}>
                {selected.includes(h) ? '✓ ' : ''}{h}
              </span>
            ))}
          </div>
          <SheetPreview headers={selected} rows={rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={!selected.length} onClick={() => downloadBlob(`trimmed.${format}`, exportTabular(selected, rows, format))}>Download {selected.length} column(s)</button>
          </div>
        </>
      )}
    </div>
  )
}
