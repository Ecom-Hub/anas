export default function MultiFilePicker({ id, files, sheets, activeSheetIndex = 0, busy, onAdd, onRemove, onSelectSheet, label }) {
  return (
    <>
      <div className="dropzone" onClick={() => document.getElementById(id).click()}>
        <p>
          {busy
            ? <span className="spinner" style={{ borderTopColor: 'var(--accent)' }} />
            : (label || 'Click to add CSV/Excel file(s) — add more anytime, they\u2019ll be combined')}
        </p>
      </div>
      {Array.isArray(sheets) && sheets.length > 0 && (
        <div className="tool-tabs" style={{ marginTop: 14, marginBottom: 0 }}>
          {sheets.map((sheet, index) => (
            <button
              key={`${sheet.file?.name || 'sheet'}-${index}`}
              className={`tool-tab ${activeSheetIndex === index ? 'active' : ''}`}
              onClick={() => onSelectSheet && onSelectSheet(index)}
              type="button"
            >
              {sheet.file?.name || `Sheet ${index + 1}`}
            </button>
          ))}
        </div>
      )}
      <input
        id={id}
        type="file"
        accept=".csv,.xlsx,.xls"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files.length) onAdd(e.target.files); e.target.value = '' }}
      />
      {files.length > 0 && (
        <div className="file-list">
          {files.map((f, i) => (
            <div key={i}>
              <span>{f.name}</span>
              <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => onRemove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
