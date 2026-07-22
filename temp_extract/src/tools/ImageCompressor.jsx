import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { downloadBlob, formatBytes, readAsDataURL } from './utils'

export default function ImageCompressor() {
  const [original, setOriginal] = useState(null)
  const [preview, setPreview] = useState('')
  const [maxSizeMB, setMaxSizeMB] = useState(0.5)
  const [busy, setBusy] = useState(false)
  const [resultBlob, setResultBlob] = useState(null)

  const onFile = async (file) => {
    setOriginal(file)
    setPreview(await readAsDataURL(file))
    setResultBlob(null)
  }

  const compress = async () => {
    if (!original) return
    setBusy(true)
    try {
      const compressed = await imageCompression(original, { maxSizeMB, maxWidthOrHeight: 4096, useWebWorker: true })
      setResultBlob(compressed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('compress-input').click()}>
        <p>Click to choose an image</p>
      </div>
      <input id="compress-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {preview && <img src={preview} className="preview" alt="preview" />}

      {original && (
        <>
          <div style={{ marginTop: 14 }}>
            <label className="label">Target size: {maxSizeMB} MB</label>
            <input type="range" min="0.05" max="3" step="0.05" value={maxSizeMB} onChange={(e) => setMaxSizeMB(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <div className="hint-text">Original: {formatBytes(original.size)}{resultBlob && ` → Compressed: ${formatBytes(resultBlob.size)}`}</div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={busy} onClick={compress}>{busy ? <span className="spinner" /> : 'Compress'}</button>
            {resultBlob && <button className="btn btn-ghost" onClick={() => downloadBlob('compressed.jpg', resultBlob)}>Download</button>}
          </div>
        </>
      )}
    </div>
  )
}
