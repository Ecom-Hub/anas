import { useState } from 'react'
import * as XLSX from 'xlsx'
import { downloadBlob, readAsArrayBuffer, readAsText } from './utils'

export default function CsvExcelConverter() {
  const [mode, setMode] = useState('csv2xlsx')
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const onFile = async (file) => {
    setError(''); setStatus(''); setResult(null)
    setFileName(file.name)
    try {
      if (mode === 'csv2xlsx') {
        const text = await readAsText(file)
        const wb = XLSX.read(text, { type: 'string' })
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        setResult(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
        setStatus('Ready — .xlsx generated.')
      } else {
        const buf = await readAsArrayBuffer(file)
        const wb = XLSX.read(buf, { type: 'array' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        setResult(new Blob([csv], { type: 'text/csv' }))
        setStatus(`Ready — converted sheet "${wb.SheetNames[0]}" to CSV.`)
      }
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="tool-body">
      <div className="row">
        <button className={`btn ${mode === 'csv2xlsx' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setMode('csv2xlsx'); setResult(null); setStatus('') }}>CSV → Excel</button>
        <button className={`btn ${mode === 'xlsx2csv' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setMode('xlsx2csv'); setResult(null); setStatus('') }}>Excel → CSV</button>
      </div>

      <div className="dropzone" style={{ marginTop: 16 }} onClick={() => document.getElementById('csvxlsx-input').click()}>
        <p>{fileName || `Click to choose a ${mode === 'csv2xlsx' ? '.csv' : '.xlsx / .xls'} file`}</p>
      </div>
      <input
        id="csvxlsx-input"
        type="file"
        accept={mode === 'csv2xlsx' ? '.csv' : '.xlsx,.xls'}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      {error && <div className="error-text">{error}</div>}
      {status && <div className="hint-text">{status}</div>}

      {result && (
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={() => downloadBlob(
            mode === 'csv2xlsx' ? 'converted.xlsx' : 'converted.csv',
            result
          )}>Download {mode === 'csv2xlsx' ? '.xlsx' : '.csv'}</button>
        </div>
      )}
    </div>
  )
}
