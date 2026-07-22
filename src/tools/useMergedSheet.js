import { useState } from 'react'
import { parseTabular } from './sheetUtils'

// Manages one or more uploaded CSV/Excel files, merged into a single table
// (rows concatenated, headers unioned by name).
export function useMergedSheet() {
  const [files, setFiles] = useState([])
  const [headers, setHeaders] = useState([])
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const [format, setFormat] = useState('csv')

  const reparse = async (fileArr) => {
    setBusy(true)
    try {
      const parsed = await Promise.all(fileArr.map(parseTabular))
      const headerSet = new Set()
      parsed.forEach((p) => p.headers.forEach((h) => headerSet.add(h)))
      setHeaders(Array.from(headerSet))
      setRows(parsed.flatMap((p) => p.rows))
      if (fileArr.length) setFormat(fileArr[0].name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx')
    } finally {
      setBusy(false)
    }
  }

  const addFiles = async (fileList) => {
    const newFiles = [...files, ...Array.from(fileList)]
    setFiles(newFiles)
    await reparse(newFiles)
  }

  const removeFile = async (i) => {
    const newFiles = files.filter((_, idx) => idx !== i)
    setFiles(newFiles)
    await reparse(newFiles)
  }

  return { files, headers, rows, busy, format, addFiles, removeFile, setHeaders, setRows }
}
