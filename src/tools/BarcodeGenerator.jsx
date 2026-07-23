import { useEffect, useRef, useState } from 'react'
import JsBarcode from 'jsbarcode'
import { downloadBlob } from './utils'

export default function BarcodeGenerator() {
  const [text, setText] = useState('123456789012')
  const [format, setFormat] = useState('CODE128')
  const [height, setHeight] = useState(72)
  const [width, setWidth] = useState(2)
  const [showText, setShowText] = useState(true)
  const [error, setError] = useState('')
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current) return
    if (!text.trim()) {
      svgRef.current.innerHTML = ''
      return
    }

    try {
      JsBarcode(svgRef.current, text.trim(), {
        format,
        width,
        height,
        displayValue: showText,
        margin: 10,
      })
      setError('')
    } catch (e) {
      setError('Could not generate barcode: ' + e.message)
    }
  }, [text, format, height, width, showText])

  const downloadSvg = () => {
    if (!svgRef.current) return
    const blob = new Blob([svgRef.current.outerHTML], { type: 'image/svg+xml' })
    downloadBlob('barcode.svg', blob)
  }

  return (
    <div className="tool-body">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label className="label">Value</label>
          <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="123456789012" />
        </div>
        <div style={{ width: 180 }}>
          <label className="label">Format</label>
          <select className="field" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="CODE128">CODE128</option>
            <option value="EAN13">EAN13</option>
            <option value="EAN8">EAN8</option>
            <option value="UPC">UPC</option>
          </select>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <div style={{ width: 140 }}>
          <label className="label">Bar width</label>
          <input className="field" type="number" min="1" max="6" value={width} onChange={(e) => setWidth(Number(e.target.value) || 2)} />
        </div>
        <div style={{ width: 140 }}>
          <label className="label">Height</label>
          <input className="field" type="number" min="40" max="220" value={height} onChange={(e) => setHeight(Number(e.target.value) || 72)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <label className="label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} />
            Show text
          </label>
        </div>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-primary" onClick={downloadSvg}>Download SVG</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div style={{ marginTop: 18, overflowX: 'auto', padding: 16, border: '1px solid var(--line)', borderRadius: 16, background: '#fff' }}>
        <svg ref={svgRef} />
      </div>
    </div>
  )
}