import { useEffect, useMemo, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'
import { buildDefaultMappings, mergeSheetsWithMappings } from './tabularTransforms'

export default function MergeSheets() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, busy, format, addFiles, removeFile } = useMergedSheet()
  const [mappings, setMappings] = useState([])

  useEffect(() => {
    setMappings(sheets.length ? buildDefaultMappings(sheets) : [])
  }, [sheets])

  const merged = useMemo(() => mergeSheetsWithMappings(sheets, mappings), [sheets, mappings])

  const updateMapping = (sheetIndex, sourceHeader, patch) => {
    setMappings((current) => current.map((sheetMapping, currentIndex) => {
      if (currentIndex !== sheetIndex) return sheetMapping
      const previous = sheetMapping[sourceHeader] || { mode: 'existing', target: sourceHeader }
      return {
        ...sheetMapping,
        [sourceHeader]: { ...previous, ...patch },
      }
    }))
  }

  return (
    <div className="tool-body">
      <MultiFilePicker id="merge-sheets-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} label="Click to add CSV/Excel files — add as many as you need" />

      {sheets.length > 0 && (
        <>
          <div className="hint-text">
            Sheet 1 becomes the master layout. For each later sheet, map source headers to an existing master column or create a new column when the names differ.
          </div>

          {sheets.length > 0 && (
            <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-dim)' }}>
              <div className="label">Master columns from {sheets[0]?.file?.name || 'sheet 1'}</div>
              <div className="swatch-row" style={{ marginTop: 10 }}>
                {sheets[0]?.headers.map((header) => <span className="pill" key={header}>{header}</span>)}
              </div>
            </div>
          )}

          {sheets.slice(1).map((sheet, sheetOffset) => {
            const sheetIndex = sheetOffset + 1
            const sheetMapping = mappings[sheetIndex] || {}
            return (
              <div key={`${sheet.file?.name || 'sheet'}-${sheetIndex}`} style={{ marginTop: 18, padding: 16, border: '1px solid var(--line)', borderRadius: 14, background: '#fff' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="label" style={{ marginBottom: 2 }}>{sheet.file?.name || `Sheet ${sheetIndex + 1}`}</div>
                    <div className="hint-text" style={{ marginTop: 0 }}>{sheet.headers.length} header(s), {sheet.rows.length} row(s)</div>
                  </div>
                  <span className="tool-badge">Map this sheet</span>
                </div>

                {sheet.headers.map((header) => {
                  const config = sheetMapping[header] || { mode: 'existing', target: header }
                  const isNewColumn = config.mode === 'new'
                  return (
                    <div className="row" key={header} style={{ marginTop: 12, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="label">Source header</label>
                        <div className="field" style={{ background: 'var(--bg-dim)', display: 'flex', alignItems: 'center' }}>{header}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <label className="label">Map to</label>
                        <select
                          className="field"
                          value={isNewColumn ? '__new__' : config.target}
                          onChange={(e) => {
                            if (e.target.value === '__new__') {
                              updateMapping(sheetIndex, header, { mode: 'new', target: header })
                              return
                            }
                            updateMapping(sheetIndex, header, { mode: 'existing', target: e.target.value })
                          }}
                        >
                          {sheets[0]?.headers.map((masterHeader) => <option key={masterHeader} value={masterHeader}>{masterHeader}</option>)}
                          <option value="__new__">Create new column</option>
                        </select>
                      </div>
                      {isNewColumn && (
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <label className="label">New column name</label>
                          <input
                            className="field"
                            value={config.target}
                            onChange={(e) => updateMapping(sheetIndex, header, { mode: 'new', target: e.target.value })}
                            placeholder={header}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          <div className="hint-text" style={{ marginTop: 14 }}>
            Mapped output: {merged.rows.length} row(s) across {merged.headers.length} column(s).
          </div>

          <SheetPreview headers={merged.headers} rows={merged.rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`merged.${format}`, exportTabular(merged.headers, merged.rows, format))}>Download merged {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
