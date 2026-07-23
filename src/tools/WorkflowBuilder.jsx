import { useEffect, useMemo, useState } from 'react'
import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'
import { FILTER_CONDITIONS, applyWorkflowStep, buildSheetMappings, getDefaultWorkflowStep, mapSheetWithMapping } from './tabularTransforms'

const STEP_TYPES = [
  { id: 'dedupe', label: 'Remove duplicates' },
  { id: 'filter', label: 'Filter rows' },
  { id: 'normalize', label: 'Normalize case' },
  { id: 'extract-domain', label: 'Extract domain' },
  { id: 'website-from-email', label: 'Website from email' },
  { id: 'split-name', label: 'Split full name' },
  { id: 'replace', label: 'Find & replace' },
  { id: 'keep-columns', label: 'Keep columns' },
  { id: 'lookup-enrich', label: 'Lookup & enrich' },
  { id: 'compare-sheet', label: 'Compare sheet' },
  { id: 'suppression-filter', label: 'Suppression filter' },
]

function StepCard({ step, headers, sheets, index, total, onChange, onRemove, onMoveUp, onMoveDown }) {
  const needsValue = step.type === 'filter' && ['contains', 'not_contains', 'equals'].includes(step.condition)
  const selectedColumns = Array.isArray(step.columns) ? step.columns : []
  const lookupSheet = sheets[Number(step.lookupSheetIndex)] || null
  const lookupHeaders = lookupSheet?.headers || []
  const compareSheet = sheets[Number(step.compareSheetIndex)] || null
  const compareHeaders = compareSheet?.headers || []
  const suppressionSheet = sheets[Number(step.suppressionSheetIndex)] || null
  const suppressionHeaders = suppressionSheet?.headers || []
  const selectedPullColumns = Array.isArray(step.pullColumns) ? step.pullColumns : []
  const referenceSheets = sheets.map((candidateSheet, candidateIndex) => ({
    index: candidateIndex,
    label: candidateSheet.file?.name || `Sheet ${candidateIndex + 1}`,
  }))

  return (
    <div style={{ marginTop: 14, padding: 16, border: '1px solid var(--line)', borderRadius: 14, background: '#fff' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="label" style={{ marginBottom: 2 }}>Step {index + 1}</div>
          <div className="hint-text" style={{ marginTop: 0 }}>{STEP_TYPES.find((type) => type.id === step.type)?.label || step.type}</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} disabled={index === 0} onClick={onMoveUp}>↑</button>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} disabled={index === total - 1} onClick={onMoveDown}>↓</button>
          <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={onRemove}>✕</button>
        </div>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label className="label">Action</label>
          <select className="field" value={step.type} onChange={(e) => onChange({ ...getDefaultWorkflowStep(e.target.value, headers), type: e.target.value })}>
            {STEP_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
          </select>
        </div>

        {(step.type === 'dedupe' || step.type === 'filter' || step.type === 'normalize' || step.type === 'extract-domain' || step.type === 'split-name' || step.type === 'replace' || step.type === 'website-from-email' || step.type === 'compare-sheet' || step.type === 'suppression-filter') && (
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Column</label>
            <select className="field" value={step.column} onChange={(e) => onChange({ ...step, column: e.target.value })}>
              <option value="">Select a column</option>
              {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              {!headers.length && <option value="">Upload a file first</option>}
              {headers.length > 0 && !headers.includes(step.column) && step.column && <option value={step.column}>{step.column}</option>}
            </select>
          </div>
        )}
      </div>

      {step.type === 'filter' && (
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Condition</label>
            <select className="field" value={step.condition} onChange={(e) => onChange({ ...step, condition: e.target.value })}>
              {FILTER_CONDITIONS.map((condition) => <option key={condition.id} value={condition.id}>{condition.label}</option>)}
            </select>
          </div>
          {needsValue && (
            <div style={{ flex: 1.3, minWidth: 220 }}>
              <label className="label">Value</label>
              <input className="field" value={step.value} onChange={(e) => onChange({ ...step, value: e.target.value })} placeholder="Founder" />
            </div>
          )}
        </div>
      )}

      {step.type === 'normalize' && (
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Case</label>
            <select className="field" value={step.mode} onChange={(e) => onChange({ ...step, mode: e.target.value })}>
              <option value="lower">lowercase</option>
              <option value="upper">UPPERCASE</option>
              <option value="title">Title Case</option>
            </select>
          </div>
        </div>
      )}

      {step.type === 'extract-domain' && (
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">New column name</label>
            <input className="field" value={step.target} onChange={(e) => onChange({ ...step, target: e.target.value })} placeholder="domain" />
          </div>
        </div>
      )}

      {step.type === 'website-from-email' && (
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="label">Website column</label>
            <input className="field" value={step.target || ''} onChange={(e) => onChange({ ...step, target: e.target.value })} placeholder="website" />
          </div>
        </div>
      )}

      {step.type === 'split-name' && (
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">First name column</label>
            <input className="field" value={step.firstTarget || ''} onChange={(e) => onChange({ ...step, firstTarget: e.target.value })} placeholder="first_name" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Last name column</label>
            <input className="field" value={step.lastTarget || ''} onChange={(e) => onChange({ ...step, lastTarget: e.target.value })} placeholder="last_name" />
          </div>
        </div>
      )}

      {step.type === 'replace' && (
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Find</label>
            <input className="field" value={step.find || ''} onChange={(e) => onChange({ ...step, find: e.target.value })} placeholder="Inc." />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Replace with</label>
            <input className="field" value={step.replace || ''} onChange={(e) => onChange({ ...step, replace: e.target.value })} placeholder="(leave empty to remove)" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="label">Apply to</label>
            <select className="field" value={step.scope || 'all'} onChange={(e) => onChange({ ...step, scope: e.target.value })}>
              <option value="all">All columns</option>
              <option value="column">Selected column only</option>
            </select>
          </div>
        </div>
      )}

      {step.type === 'keep-columns' && (
        <div style={{ marginTop: 12 }}>
          <label className="label">Columns to keep</label>
          <div className="pill-row">
            {headers.map((header) => {
              const active = selectedColumns.includes(header)
              return (
                <span
                  key={header}
                  className="pill"
                  style={{ cursor: 'pointer', background: active ? 'var(--accent-dim)' : 'var(--bg-dim)', borderColor: active ? 'var(--accent)' : 'var(--line)' }}
                  onClick={() => onChange({ ...step, columns: active ? selectedColumns.filter((column) => column !== header) : [...selectedColumns, header] })}
                >
                  {active ? '✓ ' : ''}{header}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {step.type === 'lookup-enrich' && (
        <>
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Reference sheet</label>
              <select className="field" value={String(step.lookupSheetIndex ?? 0)} onChange={(e) => onChange({ ...step, lookupSheetIndex: Number(e.target.value), lookupColumn: '', pullColumns: [] })}>
                {referenceSheets.map((sheet) => (
                  <option key={sheet.index} value={sheet.index}>{sheet.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Output mode</label>
              <select className="field" value={step.outputMode || 'fill-blanks'} onChange={(e) => onChange({ ...step, outputMode: e.target.value })}>
                <option value="fill-blanks">Fill blank cells / use same column names</option>
                <option value="append">Append as new columns</option>
              </select>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Match column in current sheet</label>
              <select className="field" value={step.sourceColumn || ''} onChange={(e) => onChange({ ...step, sourceColumn: e.target.value })}>
                <option value="">Select a column</option>
                {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Match column in reference sheet</label>
              <select className="field" value={step.lookupColumn || ''} onChange={(e) => onChange({ ...step, lookupColumn: e.target.value })}>
                <option value="">Select a column</option>
                {lookupHeaders.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Result mode</label>
              <select className="field" value={step.matchMode || 'enrich'} onChange={(e) => onChange({ ...step, matchMode: e.target.value })}>
                <option value="enrich">Enrich matching rows</option>
                <option value="matched-only">Keep matched rows only</option>
              </select>
            </div>
            {step.outputMode === 'append' && (
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="label">New column prefix</label>
                <input className="field" value={step.outputPrefix || ''} onChange={(e) => onChange({ ...step, outputPrefix: e.target.value })} placeholder="ref_" />
              </div>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="label">Columns to pull from reference sheet</label>
            <div className="pill-row">
              {lookupHeaders.filter((header) => header !== step.lookupColumn).map((header) => {
                const active = selectedPullColumns.includes(header)
                return (
                  <span
                    key={header}
                    className="pill"
                    style={{ cursor: 'pointer', background: active ? 'var(--accent-dim)' : 'var(--bg-dim)', borderColor: active ? 'var(--accent)' : 'var(--line)' }}
                    onClick={() => onChange({ ...step, pullColumns: active ? selectedPullColumns.filter((column) => column !== header) : [...selectedPullColumns, header] })}
                  >
                    {active ? '✓ ' : ''}{header}
                  </span>
                )
              })}
            </div>
            {!lookupHeaders.length && <div className="hint-text">Upload a reference sheet to pick columns from it.</div>}
          </div>
        </>
      )}

      {step.type === 'compare-sheet' && (
        <>
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Compare sheet</label>
              <select className="field" value={String(step.compareSheetIndex ?? 0)} onChange={(e) => onChange({ ...step, compareSheetIndex: Number(e.target.value), compareColumn: '' })}>
                {referenceSheets.map((sheet) => (
                  <option key={sheet.index} value={sheet.index}>{sheet.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Result</label>
              <select className="field" value={step.resultMode || 'only-unmatched'} onChange={(e) => onChange({ ...step, resultMode: e.target.value })}>
                <option value="only-unmatched">Keep rows not found in compare sheet</option>
                <option value="matched-only">Keep rows found in compare sheet</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Column in current sheet</label>
              <select className="field" value={step.sourceColumn || ''} onChange={(e) => onChange({ ...step, sourceColumn: e.target.value })}>
                <option value="">Select a column</option>
                {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Column in compare sheet</label>
              <select className="field" value={step.compareColumn || ''} onChange={(e) => onChange({ ...step, compareColumn: e.target.value })}>
                <option value="">Select a column</option>
                {compareHeaders.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {step.type === 'suppression-filter' && (
        <>
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Suppression sheet</label>
              <select className="field" value={String(step.suppressionSheetIndex ?? 0)} onChange={(e) => onChange({ ...step, suppressionSheetIndex: Number(e.target.value), suppressionColumn: '' })}>
                {referenceSheets.map((sheet) => (
                  <option key={sheet.index} value={sheet.index}>{sheet.label}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Current sheet column</label>
              <select className="field" value={step.sourceColumn || ''} onChange={(e) => onChange({ ...step, sourceColumn: e.target.value })}>
                <option value="">Select a column</option>
                {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </div>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Suppression column</label>
              <select className="field" value={step.suppressionColumn || ''} onChange={(e) => onChange({ ...step, suppressionColumn: e.target.value })}>
                <option value="">Select a column</option>
                {suppressionHeaders.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function WorkflowBuilder() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, busy, format, addFiles, removeFile } = useMergedSheet()
  const [newStepType, setNewStepType] = useState('dedupe')
  const [sheetMappings, setSheetMappings] = useState([])
  const [sheetWorkflows, setSheetWorkflows] = useState([])

  useEffect(() => {
    if (!sheets.length) {
      setSheetMappings([])
      setSheetWorkflows([])
      return
    }

    setSheetMappings((current) => {
      if (current.length === sheets.length) return current
      const next = buildSheetMappings(sheets)
      current.forEach((mapping, index) => {
        if (next[index]) next[index] = { ...next[index], ...mapping }
      })
      return next
    })

    setSheetWorkflows((current) => {
      const next = sheets.map((_, index) => current[index] || [])
      return next
    })

    if (activeSheetIndex >= sheets.length) {
      setActiveSheetIndex(0)
    }
  }, [sheets, activeSheetIndex, setActiveSheetIndex])

  const activeSheet = sheets[activeSheetIndex]
  const activeMapping = sheetMappings[activeSheetIndex] || {}
  const activeSteps = sheetWorkflows[activeSheetIndex] || []
  const mappedSheet = activeSheet ? mapSheetWithMapping(activeSheet, activeMapping) : { headers: [], rows: [] }

  const pipeline = useMemo(() => {
    let current = mappedSheet
    return activeSteps.map((step) => {
      const before = current
      current = applyWorkflowStep(current, step, { sheets, activeSheetIndex })
      return { beforeHeaders: before.headers, output: current }
    })
  }, [mappedSheet, activeSteps, sheets, activeSheetIndex])

  const preview = pipeline.length ? pipeline[pipeline.length - 1].output : mappedSheet

  const addStep = () => {
    setSheetWorkflows((current) => current.map((sheetSteps, index) => {
      if (index !== activeSheetIndex) return sheetSteps
      return [...sheetSteps, getDefaultWorkflowStep(newStepType, preview.headers)]
    }))
  }

  const updateMapping = (sheetIndex, sourceHeader, patch) => {
    setSheetMappings((current) => current.map((sheetMapping, currentIndex) => {
      if (currentIndex !== sheetIndex) return sheetMapping
      const previous = sheetMapping[sourceHeader] || { mode: 'existing', target: sourceHeader }
      return {
        ...sheetMapping,
        [sourceHeader]: { ...previous, ...patch },
      }
    }))
  }

  const updateStep = (index, nextStep) => {
    setSheetWorkflows((current) => current.map((sheetSteps, sheetIndex) => {
      if (sheetIndex !== activeSheetIndex) return sheetSteps
      return sheetSteps.map((step, currentIndex) => (currentIndex === index ? nextStep : step))
    }))
  }

  const removeStep = (index) => {
    setSheetWorkflows((current) => current.map((sheetSteps, sheetIndex) => {
      if (sheetIndex !== activeSheetIndex) return sheetSteps
      return sheetSteps.filter((_, currentIndex) => currentIndex !== index)
    }))
  }

  const moveStep = (index, direction) => {
    setSheetWorkflows((current) => current.map((sheetSteps, sheetIndex) => {
      if (sheetIndex !== activeSheetIndex) return sheetSteps
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= sheetSteps.length) return sheetSteps
      const next = [...sheetSteps]
      const [moving] = next.splice(index, 1)
      next.splice(targetIndex, 0, moving)
      return next
    }))
  }

  return (
    <div className="tool-body">
      <MultiFilePicker id="workflow-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} label="Upload one or more CSV/Excel files to build a reusable pipeline" />

      {sheets.length > 0 && (
        <>
          <div className="hint-text">
            Select a sheet, map its columns, then run the workflow on that sheet. Each sheet keeps its own mapping and step list.
          </div>

          {activeSheet && (
            <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--line)', borderRadius: 12, background: 'var(--bg-dim)' }}>
              <div className="label">Mapping for {activeSheet.file?.name || `Sheet ${activeSheetIndex + 1}`}</div>
              <div className="hint-text" style={{ marginTop: 4 }}>Map source headers to the working columns used by the workflow.</div>

              {activeSheet.headers.map((header) => {
                const config = activeMapping[header] || { mode: 'existing', target: header }
                const isNewColumn = config.mode === 'new'
                return (
                  <div className="row" key={header} style={{ marginTop: 12, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <label className="label">Source header</label>
                      <div className="field" style={{ background: '#fff', display: 'flex', alignItems: 'center' }}>{header}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <label className="label">Map to</label>
                      <select
                        className="field"
                        value={isNewColumn ? '__new__' : config.target}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            updateMapping(selectedSheetIndex, header, { mode: 'new', target: header })
                            return
                          }
                          updateMapping(selectedSheetIndex, header, { mode: 'existing', target: e.target.value })
                        }}
                      >
                        {activeSheet.headers.map((candidate) => <option key={candidate} value={candidate}>{candidate}</option>)}
                        <option value="__new__">Create new column</option>
                      </select>
                    </div>
                    {isNewColumn && (
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <label className="label">New column name</label>
                        <input
                          className="field"
                          value={config.target}
                          onChange={(e) => updateMapping(selectedSheetIndex, header, { mode: 'new', target: e.target.value })}
                          placeholder={header}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="row" style={{ marginTop: 14, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label className="label">Add step</label>
              <select className="field" value={newStepType} onChange={(e) => setNewStepType(e.target.value)}>
                {STEP_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={addStep}>+ Add step</button>
          </div>

          {activeSteps.length === 0 && <div className="hint-text" style={{ marginTop: 14 }}>No steps yet for this sheet. Add one to start the pipeline.</div>}

          {activeSteps.map((step, index) => {
            const stepHeaders = pipeline[index]?.beforeHeaders || headers
            return (
              <StepCard
                key={`${step.type}-${index}`}
                step={step}
                headers={stepHeaders}
                sheets={sheets}
                index={index}
                total={activeSteps.length}
                onChange={(nextStep) => updateStep(index, nextStep)}
                onRemove={() => removeStep(index)}
                onMoveUp={() => moveStep(index, -1)}
                onMoveDown={() => moveStep(index, 1)}
              />
            )
          })}

          {activeSteps.length > 0 && (
            <>
              <div className="hint-text" style={{ marginTop: 14 }}>
                Final output for {activeSheet.file?.name || `Sheet ${selectedSheetIndex + 1}`}: {preview.rows.length} row(s) across {preview.headers.length} column(s).
              </div>
              <SheetPreview headers={preview.headers} rows={preview.rows} />
              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={() => downloadBlob(`workflow-${selectedSheetIndex + 1}.${format}`, exportTabular(preview.headers, preview.rows, format))}>Download workflow result {format.toUpperCase()}</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}