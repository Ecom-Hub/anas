import { useState } from 'react'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const encode = () => {
    try { setOutput(btoa(unescape(encodeURIComponent(input)))); setError('') }
    catch (e) { setError(e.message) }
  }
  const decode = () => {
    try { setOutput(decodeURIComponent(escape(atob(input)))); setError('') }
    catch (e) { setError('Not valid Base64') }
  }

  return (
    <div className="tool-body">
      <label className="label">Text</label>
      <textarea className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type text or Base64…" />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={encode}>Encode</button>
        <button className="btn btn-ghost" onClick={decode}>Decode</button>
      </div>
      {error && <div className="error-text">{error}</div>}
      {output && (
        <>
          <div className="result-box">{output}</div>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
        </>
      )}
    </div>
  )
}
