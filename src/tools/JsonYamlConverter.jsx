import { useState } from 'react'
import { dump, load } from 'js-yaml'
import { downloadBlob, readAsText } from './utils'

export default function JsonYamlConverter() {
  const [mode, setMode] = useState('json2yaml')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = (text, m) => {
    setError('')
    try {
      if (m === 'json2yaml') {
        const obj = JSON.parse(text)
        setOutput(dump(obj))
      } else {
        const obj = load(text)
        setOutput(JSON.stringify(obj, null, 2))
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

  return (
    <div className="tool-body">
      <div className="row">
        <button className={`btn ${mode === 'json2yaml' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setMode('json2yaml'); if (input) convert(input, 'json2yaml') }}>JSON → YAML</button>
        <button className={`btn ${mode === 'yaml2json' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setMode('yaml2json'); if (input) convert(input, 'yaml2json') }}>YAML → JSON</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="label">Paste {mode === 'json2yaml' ? 'JSON' : 'YAML'}, or upload a file</label>
        <textarea
          className="field"
          value={input}
          onChange={(e) => { setInput(e.target.value); convert(e.target.value, mode) }}
          placeholder={mode === 'json2yaml' ? '{"name":"Anas"}' : 'name: Anas'}
        />
        <input type="file" accept=".json,.yaml,.yml" style={{ marginTop: 10 }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      </div>

      {error && <div className="error-text">{error}</div>}
      {output && (
        <>
          <div className="result-box">{output}</div>
          <div className="row">
            <button className="btn btn-primary" onClick={() => downloadBlob(
              mode === 'json2yaml' ? 'converted.yaml' : 'converted.json',
              output
            )}>Download</button>
          </div>
        </>
      )}
    </div>
  )
}
