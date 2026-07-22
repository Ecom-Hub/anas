import { useState } from 'react'
import { downloadBlob } from './utils'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = (indent) => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj, null, indent))
      setError('')
    } catch (e) {
      setError(e.message)
      setOutput('')
    }
  }

  return (
    <div className="tool-body">
      <label className="label">Paste JSON</label>
      <textarea className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder='{"name":"Anas","tools":["automation","outreach"]}' />

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={() => format(2)}>Pretty-print</button>
        <button className="btn btn-ghost" onClick={() => format(0)}>Minify</button>
      </div>

      {error && <div className="error-text">Invalid JSON: {error}</div>}
      {output && (
        <>
          <div className="result-box">{output}</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
            <button className="btn btn-ghost" onClick={() => downloadBlob('formatted.json', output)}>Download</button>
          </div>
        </>
      )}
    </div>
  )
}
