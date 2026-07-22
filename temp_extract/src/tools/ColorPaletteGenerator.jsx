import { useState } from 'react'

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r, g, b
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function ColorPaletteGenerator() {
  const [base, setBase] = useState('#0071e3')
  const [mode, setMode] = useState('analogous')

  const [h, s, l] = hexToHsl(base)

  const palettes = {
    analogous: [-30, -15, 0, 15, 30].map((d) => hslToHex((h + d + 360) % 360, s, l)),
    complementary: [0, 180].map((d) => hslToHex((h + d) % 360, s, l)).concat([hslToHex(h, s, Math.min(90, l + 20)), hslToHex(h, s, Math.max(10, l - 20)), hslToHex((h + 180) % 360, s, Math.min(90, l + 20))]),
    monochrome: [20, 35, 50, 65, 80].map((lv) => hslToHex(h, s, lv)),
    triadic: [0, 120, 240].map((d) => hslToHex((h + d) % 360, s, l)).concat([hslToHex(h, s, Math.min(90, l + 25)), hslToHex((h + 120) % 360, s, Math.min(90, l + 25))]),
  }

  const colors = palettes[mode]

  return (
    <div className="tool-body">
      <div className="row">
        <div>
          <label className="label">Base color</label>
          <input type="color" value={base} onChange={(e) => setBase(e.target.value)} style={{ width: 60, height: 40, border: 'none', background: 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">Style</label>
          <select className="field" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="monochrome">Monochrome</option>
            <option value="triadic">Triadic</option>
          </select>
        </div>
      </div>
      <div className="swatch-row" style={{ marginTop: 26 }}>
        {colors.map((c, i) => (
          <div key={i} className="swatch" style={{ background: c }} onClick={() => navigator.clipboard.writeText(c)} title="Click to copy">
            <span>{c}</span>
          </div>
        ))}
      </div>
      <div className="hint-text" style={{ marginTop: 24 }}>Click a swatch to copy its hex code.</div>
    </div>
  )
}
