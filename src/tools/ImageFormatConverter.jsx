import { useState } from 'react'
import { downloadBlob, readAsDataURL } from './utils'

const formats = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
]

export default function ImageFormatConverter() {
  const [img, setImg] = useState(null)
  const [preview, setPreview] = useState('')
  const [target, setTarget] = useState(formats[1])

  const onFile = async (file) => {
    const dataUrl = await readAsDataURL(file)
    setPreview(dataUrl)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = dataUrl
  }

  const download = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (target.mime === 'image/jpeg') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0)
    canvas.toBlob((blob) => downloadBlob(`converted.${target.ext}`, blob), target.mime, 0.92)
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('format-input').click()}>
        <p>Click to choose an image</p>
      </div>
      <input id="format-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {preview && <img src={preview} className="preview" alt="preview" />}

      {img && (
        <>
          <div className="row" style={{ marginTop: 14 }}>
            {formats.map((f) => (
              <button key={f.ext} className={`btn ${target.ext === f.ext ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTarget(f)}>{f.label}</button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={download}>Download as {target.label}</button>
          </div>
        </>
      )}
    </div>
  )
}
