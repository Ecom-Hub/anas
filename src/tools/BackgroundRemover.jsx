import { useState } from 'react'
import { downloadBlob, readAsDataURL } from './utils'

export default function BackgroundRemover() {
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFile = async (file) => {
    setError(''); setResult('')
    const dataUrl = await readAsDataURL(file)
    setPreview(dataUrl)
    setBusy(true)
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(file)
      setResult(URL.createObjectURL(blob))
    } catch (e) {
      setError('Could not process this image: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('bgremove-input').click()}>
        <p>Click to choose a photo</p>
      </div>
      <input id="bgremove-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {preview && !result && !error && (
        <div>
          <img src={preview} className="preview" alt="preview" />
          {busy && <div className="hint-text">Removing background — first run downloads a small model, this can take a moment…</div>}
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      {result && (
        <>
          <img src={result} className="preview" alt="result" style={{ background: 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 20px 20px' }} />
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={() => fetch(result).then((r) => r.blob()).then((b) => downloadBlob('no-background.png', b))}>
              Download PNG
            </button>
          </div>
        </>
      )}
    </div>
  )
}
