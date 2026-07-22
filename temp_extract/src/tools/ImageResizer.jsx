import { useState } from 'react'
import { downloadBlob, readAsDataURL } from './utils'

export default function ImageResizer() {
  const [img, setImg] = useState(null)
  const [preview, setPreview] = useState('')
  const [w, setW] = useState(800)
  const [h, setH] = useState(600)
  const [lock, setLock] = useState(true)
  const [ratio, setRatio] = useState(1)
  const [busy, setBusy] = useState(false)

  const onFile = async (file) => {
    const dataUrl = await readAsDataURL(file)
    setPreview(dataUrl)
    const image = new Image()
    image.onload = () => {
      setImg(image)
      setW(image.width)
      setH(image.height)
      setRatio(image.width / image.height)
    }
    image.src = dataUrl
  }

  const onW = (val) => {
    setW(val)
    if (lock) setH(Math.round(val / ratio))
  }
  const onH = (val) => {
    setH(val)
    if (lock) setW(Math.round(val * ratio))
  }

  const download = () => {
    setBusy(true)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    canvas.toBlob((blob) => { downloadBlob(`resized-${w}x${h}.png`, blob); setBusy(false) }, 'image/png')
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('resize-input').click()}>
        <p>Click to choose an image</p>
      </div>
      <input id="resize-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {preview && <img src={preview} className="preview" alt="preview" />}

      {img && (
        <>
          <div className="row" style={{ marginTop: 14 }}>
            <div>
              <label className="label">Width (px)</label>
              <input className="field" type="number" value={w} onChange={(e) => onW(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Height (px)</label>
              <input className="field" type="number" value={h} onChange={(e) => onH(Number(e.target.value))} />
            </div>
          </div>
          <label className="hint-text" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Lock aspect ratio
          </label>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={busy} onClick={download}>{busy ? <span className="spinner" /> : 'Download resized PNG'}</button>
          </div>
        </>
      )}
    </div>
  )
}
