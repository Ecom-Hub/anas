import { exportTabular } from './sheetUtils'
import { downloadBlob } from './utils'
import SheetPreview from './SheetPreview'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

export default function MergeSheets() {
  const { files, headers, rows, busy, format, addFiles, removeFile } = useMergedSheet()

  return (
    <div className="tool-body">
      <MultiFilePicker id="merge-sheets-input" files={files} busy={busy} onAdd={addFiles} onRemove={removeFile} label="Click to add CSV/Excel files — add as many as you need" />

      {headers.length > 0 && (
        <>
          <div className="hint-text">
            {files.length} file(s) combined into {rows.length} rows, {headers.length} columns. Columns are matched by header name — different names won't auto-merge (use the Outreach Column Mapper for that).
          </div>
          <SheetPreview headers={headers} rows={rows} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => downloadBlob(`merged.${format}`, exportTabular(headers, rows, format))}>Download merged {format.toUpperCase()}</button>
          </div>
        </>
      )}
    </div>
  )
}
