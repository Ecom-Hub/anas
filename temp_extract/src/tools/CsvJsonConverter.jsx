import { useState } from 'react'
import Papa from 'papaparse'
import { downloadBlob, readAsText } from './utils'

export default function CsvJsonConverter() {
  const [mode, setMode] = useState('csv2json')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = (text, m) => {
    setError('')
    try {
      if (m === 'csv2json') {
        const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true })
        if (res.errors?.length) throw new Error(res.errors[0].message)
        setOutput(JSON.stringify(res.data, null, 2))
      } else {
        const data = JSON.parse(text)
        const csv = Papa.unparse(Array.isArray(data) ? data : [data])
        setOutput(csv)
      }
    } catch (e) {
      setError(e.message)
      setOutput('')
    }
  }

  const onFile = async (file) => {
    const text = await readAsText(file)
    setInput(text)
    convert(text, mode)
  }

  const onModeChange = (m) => {
    setMode(m)
    if (input) convert(input, m)
  }

  return (
    <div className="tool-body">
      <div className="row">
        <button className={`btn ${mode === 'csv2json' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onModeChange('csv2json')}>CSV → JSON</button>
        <button className={`btn ${mode === 'json2csv' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onModeChange('json2csv')}>JSON → CSV</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="label">Paste {mode === 'csv2json' ? 'CSV' : 'JSON'}, or upload a file</label>
        <textarea
          className="field"
          placeholder={mode === 'csv2json' ? 'name,age\nAnas,25' : '[{"name":"Anas","age":25}]'}
          value={input}
          onChange={(e) => { setInput(e.target.value); convert(e.target.value, mode) }}
        />
        <input
          type="file"
          accept={mode === 'csv2json' ? '.csv,text/csv' : '.json,application/json'}
          style={{ marginTop: 10 }}
          onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
        />
      </div>

      {error && <div className="error-text">{error}</div>}

      {output && (
        <>
          <div className="result-box">{output}</div>
          <div className="row">
            <button className="btn btn-primary" onClick={() => downloadBlob(
              mode === 'csv2json' ? 'converted.json' : 'converted.csv',
              output,
              mode === 'csv2json' ? 'application/json' : 'text/csv'
            )}>Download {mode === 'csv2json' ? 'JSON' : 'CSV'}</button>
          </div>
        </>
      )}
    </div>
  )
}
