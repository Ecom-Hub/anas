import { useMemo, useState } from 'react'
import { parseTabular } from './sheetUtils'

// Manages one or more uploaded CSV/Excel files, merged into a single table
// (rows concatenated, headers unioned by name).
export function useMergedSheet() {
  const [files, setFiles] = useState([])
  const [sheets, setSheets] = useState([])
  const [busy, setBusy] = useState(false)
  const [activeSheetIndex, setActiveSheetIndex] = useState(0)

  const reparse = async (fileArr) => {
    setBusy(true)
    try {
      const parsed = await Promise.all(fileArr.map(parseTabular))
      setSheets(parsed.map((sheet, index) => ({
        file: fileArr[index],
        headers: sheet.headers,
        rows: sheet.rows,
        format: fileArr[index].name.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx',
      })))
      setActiveSheetIndex((current) => {
        if (!fileArr.length) return 0
        return Math.min(current, fileArr.length - 1)
      })
      if (!fileArr.length) setSheets([])
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

  const activeSheet = sheets[activeSheetIndex] || null
  const headers = activeSheet?.headers || []
  const rows = activeSheet?.rows || []
  const format = activeSheet?.format || (files[0]?.name?.toLowerCase()?.endsWith('.csv') ? 'csv' : files.length ? 'xlsx' : 'csv')

  const value = useMemo(() => ({
    files,
    sheets,
    activeSheetIndex,
    activeSheet,
    headers,
    rows,
    busy,
    format,
    addFiles,
    removeFile,
    setActiveSheetIndex,
  }), [files, sheets, activeSheetIndex, activeSheet, headers, rows, busy, format])

  return value
}
