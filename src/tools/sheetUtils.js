import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { readAsArrayBuffer, readAsText } from './utils'

// Parses a CSV or Excel file into { headers: string[], rows: object[] }
export async function parseTabular(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || file.type === 'text/csv') {
    const text = await readAsText(file)
    const res = Papa.parse(text.trim(), { header: true, skipEmptyLines: true })
    const headers = res.meta.fields || []
    return { headers, rows: res.data }
  }
  const buf = await readAsArrayBuffer(file)
  const wb = XLSX.read(buf, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  const headers = rows.length ? Object.keys(rows[0]) : (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [])
  return { headers, rows }
}

// Exports rows (array of objects) as either csv or xlsx Blob
export function exportTabular(headers, rows, format = 'csv') {
  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }
  const csv = Papa.unparse({ fields: headers, data: rows.map((r) => headers.map((h) => r[h] ?? '')) })
  return new Blob([csv], { type: 'text/csv' })
}
