import { useState } from 'react'
import { downloadBlob, readAsDataURL } from './utils'

export default function ImageWatermark() {
  const [img, setImg] = useState(null)
  const [preview, setPreview] = useState('')
  const [text, setText] = useState('© Anas Qureshi')
  const [opacity, setOpacity] = useState(0.5)
  const [size, setSize] = useState(32)
  const [color, setColor] = useState('#ffffff')

  const onFile = async (file) => {
    const dataUrl = await readAsDataURL(file)
    setPreview(dataUrl)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = dataUrl
  }

  const render = (canvas) => {
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.font = `bold ${size}px -apple-system, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(text, canvas.width - 24, canvas.height - 24)
    ctx.globalAlpha = 1
  }

  const download = () => {
    const canvas = document.createElement('canvas')
    render(canvas)
    canvas.toBlob((blob) => downloadBlob('watermarked.png', blob), 'image/png')
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('watermark-input').click()}>
        <p>Click to choose an image</p>
      </div>
      <input id="watermark-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {preview && <img src={preview} className="preview" alt="preview" />}

      {img && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Watermark text</label>
            <input className="field" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <div>
              <label className="label">Opacity</label>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Size</label>
              <input type="range" min="12" max="80" value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={download}>Download watermarked image</button>
          </div>
        </>
      )}
    </div>
  )
}
