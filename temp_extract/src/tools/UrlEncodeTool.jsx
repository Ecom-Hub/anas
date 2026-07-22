import { useState } from 'react'

export default function UrlEncodeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  return (
    <div className="tool-body">
      <label className="label">Text or URL</label>
      <textarea className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://example.com/search?q=hello world" />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={() => setOutput(encodeURIComponent(input))}>Encode</button>
        <button className="btn btn-ghost" onClick={() => { try { setOutput(decodeURIComponent(input)) } catch { setOutput('Invalid encoded string') } }}>Decode</button>
      </div>
      {output && (
        <>
          <div className="result-box">{output}</div>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
        </>
      )}
    </div>
  )
}
