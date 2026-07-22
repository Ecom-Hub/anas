import { useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { downloadBlob, readAsDataURL } from './utils'

export default function ImageCropper() {
  const [src, setSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const imgRef = useRef(null)

  const onFile = async (file) => {
    setSrc(await readAsDataURL(file))
    setCrop(undefined)
  }

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 80 }, 1, width, height), width, height)
    setCrop(c)
  }

  const download = () => {
    const image = imgRef.current
    const c = completedCrop
    if (!image || !c || !c.width || !c.height) return
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const canvas = document.createElement('canvas')
    canvas.width = c.width * scaleX
    canvas.height = c.height * scaleY
    const ctx = canvas.getContext('2d')
    ctx.drawImage(
      image,
      c.x * scaleX, c.y * scaleY, c.width * scaleX, c.height * scaleY,
      0, 0, canvas.width, canvas.height
    )
    canvas.toBlob((blob) => downloadBlob('cropped.png', blob), 'image/png')
  }

  return (
    <div className="tool-body">
      <div className="dropzone" onClick={() => document.getElementById('crop-input').click()}>
        <p>Click to choose an image</p>
      </div>
      <input id="crop-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />

      {src && (
        <div style={{ marginTop: 14 }}>
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
            <img ref={imgRef} src={src} onLoad={onImageLoad} alt="to crop" style={{ maxHeight: 320 }} />
          </ReactCrop>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" onClick={download}>Download cropped image</button>
          </div>
        </div>
      )}
    </div>
  )
}
