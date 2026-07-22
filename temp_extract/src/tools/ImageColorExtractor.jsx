import { useState } from 'react'
import { readAsDataURL } from './utils'

function quantize(pixels, k) {
  // simple k-means-ish bucket approach on RGB
  const buckets = {}
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3]
    if (a < 100) continue
    const key = `${r >> 4}-${g >> 4}-${b >> 4}`
    if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 }
    buckets[key].r += r; buckets[key].g += g; buckets[key].b += b; buckets[key].count++
  }
  const arr = Object.values(buckets).sort((a, b) => b.count - a.count).slice(0, k)
  return arr.map((c) => {
    const r = Math.round(c.r / c.count), g = Math.round(c.g / c.count), b = Math.round(c.b / c.count)
    return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
  })
}

export default function ImageColorExtractor() {
  const [preview, setPreview] = useState('')
  const [colors, setColors] = useState([])

  const onFile = async (file) => {
    const dataUrl = await readAsDataURL(file)
    setPreview(dataUrl)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 200 / img.width)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      setColors(quantize(data, 6))
    }
    img.src = dataUrl
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('extract-input').click()}>
        <p>Click to choose an image</p>
      </div>
      <input id="extract-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {preview && <img src={preview} className="preview" alt="preview" />}

      {colors.length > 0 && (
        <>
          <div className="swatch-row" style={{ marginTop: 26 }}>
            {colors.map((c, i) => (
              <div key={i} className="swatch" style={{ background: c }} onClick={() => navigator.clipboard.writeText(c)} title="Click to copy">
                <span>{c}</span>
              </div>
            ))}
          </div>
          <div className="hint-text" style={{ marginTop: 24 }}>Click a swatch to copy its hex code.</div>
        </>
      )}
    </div>
  )
}
