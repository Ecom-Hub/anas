import { useState } from 'react'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { downloadBlob, readAsText } from './utils'

const turndown = new TurndownService()

export default function MarkdownHtmlConverter() {
  const [mode, setMode] = useState('md2html')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = (text, m) => {
    setError('')
    try {
      setOutput(m === 'md2html' ? marked.parse(text) : turndown.turndown(text))
    } catch (e) {
      setError(e.message)
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
        <button className={`btn ${mode === 'md2html' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setMode('md2html'); if (input) convert(input, 'md2html') }}>Markdown → HTML</button>
        <button className={`btn ${mode === 'html2md' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setMode('html2md'); if (input) convert(input, 'html2md') }}>HTML → Markdown</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="label">Paste {mode === 'md2html' ? 'Markdown' : 'HTML'}, or upload a file</label>
        <textarea className="field" value={input} onChange={(e) => { setInput(e.target.value); convert(e.target.value, mode) }} placeholder={mode === 'md2html' ? '# Hello world' : '<h1>Hello world</h1>'} />
        <input type="file" accept={mode === 'md2html' ? '.md,.markdown,.txt' : '.html,.htm'} style={{ marginTop: 10 }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      </div>

      {error && <div className="error-text">{error}</div>}
      {output && (
        <>
          <div className="result-box">{output}</div>
          <div className="row">
            <button className="btn btn-primary" onClick={() => downloadBlob(mode === 'md2html' ? 'converted.html' : 'converted.md', output)}>Download</button>
          </div>
        </>
      )}
    </div>
  )
}
