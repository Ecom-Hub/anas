import { useState } from 'react'

export default function GradientGenerator() {
  const [c1, setC1] = useState('#0071e3')
  const [c2, setC2] = useState('#7c3aed')
  const [angle, setAngle] = useState(135)
  const [type, setType] = useState('linear')

  const css = type === 'linear'
    ? `linear-gradient(${angle}deg, ${c1}, ${c2})`
    : `radial-gradient(circle, ${c1}, ${c2})`

  return (
    <div className="tool-body">
      <div style={{ height: 160, borderRadius: 16, background: css, border: '1px solid var(--line)' }} />

      <div className="row" style={{ marginTop: 16 }}>
        <div>
          <label className="label">Color 1</label>
          <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} style={{ width: 60, height: 40, border: 'none' }} />
        </div>
        <div>
          <label className="label">Color 2</label>
          <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} style={{ width: 60, height: 40, border: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">Type</label>
          <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>
      </div>

      {type === 'linear' && (
        <div style={{ marginTop: 14 }}>
          <label className="label">Angle: {angle}°</label>
          <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: '100%' }} />
        </div>
      )}

      <div className="result-box" style={{ marginTop: 16 }}>background: {css};</div>
      <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(`background: ${css};`)}>Copy CSS</button>
    </div>
  )
}
