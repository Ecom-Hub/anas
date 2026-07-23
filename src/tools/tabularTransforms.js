export const FILTER_CONDITIONS = [
  { id: 'contains', label: 'contains' },
  { id: 'not_contains', label: 'does not contain' },
  { id: 'equals', label: 'equals' },
  { id: 'not_empty', label: 'is not empty' },
  { id: 'empty', label: 'is empty' },
]

export function normalizeText(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function toTitleCase(value) {
  return String(value ?? '').replace(/\w\S*/g, (segment) => segment[0].toUpperCase() + segment.slice(1).toLowerCase())
}

export function matchesFilterCondition(value, condition, needle) {
  const text = String(value ?? '')
  const query = String(needle ?? '')

  switch (condition) {
    case 'contains':
      return text.toLowerCase().includes(query.toLowerCase())
    case 'not_contains':
      return !text.toLowerCase().includes(query.toLowerCase())
    case 'equals':
      return text.toLowerCase() === query.toLowerCase()
    case 'not_empty':
      return text.trim() !== ''
    case 'empty':
      return text.trim() === ''
    default:
      return true
  }
}

export function getDefaultWorkflowStep(type, headers = []) {
  const fallbackHeader = headers[0] || ''
  const emailHeader = headers.find((header) => /email/i.test(header)) || fallbackHeader

  switch (type) {
    case 'dedupe':
      return { type, column: emailHeader }
    case 'filter':
      return { type, column: fallbackHeader, condition: 'contains', value: '' }
    case 'normalize':
      return { type, column: emailHeader, mode: 'lower' }
    case 'extract-domain':
      return { type, column: emailHeader, target: 'domain' }
    case 'split-name':
      return { type, column: fallbackHeader, firstTarget: 'first_name', lastTarget: 'last_name' }
    case 'replace':
      return { type, column: fallbackHeader, find: '', replace: '', scope: 'all' }
    case 'keep-columns':
      return { type, columns: [...headers] }
    case 'lookup-enrich':
      return {
        type,
        lookupSheetIndex: 0,
        sourceColumn: emailHeader,
        lookupColumn: emailHeader,
        pullColumns: [],
        outputMode: 'fill-blanks',
        outputPrefix: 'ref_',
        matchMode: 'enrich',
      }
    case 'compare-sheet':
      return {
        type,
        compareSheetIndex: 0,
        sourceColumn: emailHeader,
        compareColumn: emailHeader,
        resultMode: 'only-unmatched',
      }
    case 'suppression-filter':
      return {
        type,
        suppressionSheetIndex: 0,
        sourceColumn: emailHeader,
        suppressionColumn: emailHeader,
      }
    case 'website-from-email':
      return { type, column: emailHeader, target: 'website' }
    default:
      return { type }
  }
}

export function applyWorkflowStep(data, step, context = {}) {
  const { rows, headers } = data

  switch (step.type) {
    case 'dedupe': {
      if (!step.column) return data
      const seen = new Set()
      const filtered = []

      for (const row of rows) {
        const key = String(row[step.column] ?? '').trim().toLowerCase()
        if (!key || !seen.has(key)) {
          if (key) seen.add(key)
          filtered.push(row)
        }
      }

      return { rows: filtered, headers }
    }

    case 'filter': {
      if (!step.column) return data
      const filtered = rows.filter((row) => matchesFilterCondition(row[step.column], step.condition, step.value))
      return { rows: filtered, headers }
    }

    case 'normalize': {
      if (!step.column) return data
      const normalized = rows.map((row) => {
        const current = String(row[step.column] ?? '')
        const nextValue = step.mode === 'upper' ? current.toUpperCase() : step.mode === 'title' ? toTitleCase(current) : current.toLowerCase()
        return { ...row, [step.column]: nextValue }
      })
      return { rows: normalized, headers }
    }

    case 'extract-domain': {
      if (!step.column) return data
      const target = String(step.target ?? '').trim() || 'domain'
      const nextHeaders = headers.includes(target) ? headers : [...headers, target]
      const extracted = rows.map((row) => {
        const value = String(row[step.column] ?? '')
        const domain = value.includes('@') ? (value.split('@')[1] || '').trim() : ''
        return { ...row, [target]: domain }
      })
      return { rows: extracted, headers: nextHeaders }
    }

    case 'split-name': {
      if (!step.column) return data
      const firstTarget = String(step.firstTarget ?? '').trim() || 'first_name'
      const lastTarget = String(step.lastTarget ?? '').trim() || 'last_name'
      const nextHeaders = [
        ...headers,
        ...(headers.includes(firstTarget) ? [] : [firstTarget]),
        ...(headers.includes(lastTarget) ? [] : [lastTarget]),
      ]
      const split = rows.map((row) => {
        const parts = String(row[step.column] ?? '').trim().split(/\s+/).filter(Boolean)
        const first = parts[0] || ''
        const last = parts.slice(1).join(' ')
        return { ...row, [firstTarget]: first, [lastTarget]: last }
      })
      return { rows: split, headers: nextHeaders }
    }

    case 'replace': {
      const find = String(step.find ?? '')
      if (!find) return data
      const replace = String(step.replace ?? '')
      const scopeColumns = step.scope === 'all' ? headers : [step.column].filter(Boolean)
      const replaced = rows.map((row) => {
        const nextRow = { ...row }
        scopeColumns.forEach((column) => {
          const value = String(nextRow[column] ?? '')
          if (value.includes(find)) {
            nextRow[column] = value.split(find).join(replace)
          }
        })
        return nextRow
      })
      return { rows: replaced, headers }
    }

    case 'keep-columns': {
      const columns = Array.isArray(step.columns) ? step.columns.filter(Boolean) : []
      if (!columns.length) return data
      const keptRows = rows.map((row) => {
        const nextRow = {}
        columns.forEach((column) => {
          nextRow[column] = row[column] ?? ''
        })
        return nextRow
      })
      return { rows: keptRows, headers: columns }
    }

    case 'website-from-email': {
      if (!step.column) return data
      const target = String(step.target ?? '').trim() || 'website'
      const nextHeaders = headers.includes(target) ? headers : [...headers, target]
      const converted = rows.map((row) => {
        const email = String(row[step.column] ?? '').trim()
        const domain = email.includes('@') ? (email.split('@')[1] || '').trim() : ''
        const website = domain ? `https://${domain}` : ''
        return { ...row, [target]: website }
      })
      return { rows: converted, headers: nextHeaders }
    }

    case 'lookup-enrich': {
      const referenceSheet = context?.sheets?.[Number(step.lookupSheetIndex)]
      if (!referenceSheet || !step.sourceColumn || !step.lookupColumn) return data

      const pullColumns = Array.isArray(step.pullColumns) ? step.pullColumns.filter(Boolean) : []
      if (!pullColumns.length) return data

      const lookup = new Map()
      referenceSheet.rows.forEach((referenceRow) => {
        const key = normalizeText(referenceRow[step.lookupColumn])
        if (key && !lookup.has(key)) {
          lookup.set(key, referenceRow)
        }
      })

      const outputHeaders = [...headers]
      const outputSet = new Set(outputHeaders)
      const outputPrefix = String(step.outputPrefix ?? '').trim()
      const fillBlanks = step.outputMode !== 'append'

      pullColumns.forEach((column) => {
        const targetHeader = fillBlanks ? column : `${outputPrefix}${column}`
        if (!outputSet.has(targetHeader)) {
          outputSet.add(targetHeader)
          outputHeaders.push(targetHeader)
        }
      })

      const enrichedRows = []
      rows.forEach((row) => {
        const key = normalizeText(row[step.sourceColumn])
        const match = key ? lookup.get(key) : null

        if (step.matchMode === 'matched-only' && !match) {
          return
        }

        const nextRow = { ...row }
        pullColumns.forEach((column) => {
          const sourceValue = match ? (match[column] ?? '') : ''
          const targetHeader = fillBlanks ? column : `${outputPrefix}${column}`

          if (fillBlanks) {
            if (String(nextRow[targetHeader] ?? '').trim() === '' && sourceValue !== '') {
              nextRow[targetHeader] = sourceValue
            } else if (!(targetHeader in nextRow)) {
              nextRow[targetHeader] = sourceValue
            }
          } else {
            nextRow[targetHeader] = sourceValue
          }
        })

        enrichedRows.push(nextRow)
      })

      return { rows: enrichedRows, headers: outputHeaders }
    }

    case 'compare-sheet': {
      const compareSheet = context?.sheets?.[Number(step.compareSheetIndex)]
      if (!compareSheet || !step.sourceColumn || !step.compareColumn) return data

      const compareSet = new Set(compareSheet.rows.map((row) => normalizeText(row[step.compareColumn])).filter(Boolean))
      const matched = rows.filter((row) => compareSet.has(normalizeText(row[step.sourceColumn])))
      const unmatched = rows.filter((row) => !compareSet.has(normalizeText(row[step.sourceColumn])))

      return step.resultMode === 'matched-only' ? { rows: matched, headers } : { rows: unmatched, headers }
    }

    case 'suppression-filter': {
      const suppressionSheet = context?.sheets?.[Number(step.suppressionSheetIndex)]
      if (!suppressionSheet || !step.sourceColumn || !step.suppressionColumn) return data

      const blocked = new Set(suppressionSheet.rows.map((row) => normalizeText(row[step.suppressionColumn])).filter(Boolean))
      const clean = rows.filter((row) => !blocked.has(normalizeText(row[step.sourceColumn])))
      return { rows: clean, headers }
    }

    default:
      return data
  }
}

export function buildDefaultMappings(sheets) {
  const masterHeaders = sheets[0]?.headers || []

  return sheets.map((sheet, sheetIndex) => {
    const mapping = {}

    sheet.headers.forEach((header) => {
      if (sheetIndex === 0) {
        mapping[header] = { mode: 'existing', target: header }
        return
      }

      const matchedHeader = masterHeaders.find((candidate) => normalizeText(candidate) === normalizeText(header)) || ''
      mapping[header] = {
        mode: matchedHeader ? 'existing' : 'new',
        target: matchedHeader || header,
      }
    })

    return mapping
  })
}

export function buildSheetMappings(sheets) {
  return sheets.map((sheet) => {
    const mapping = {}
    sheet.headers.forEach((header) => {
      mapping[header] = { mode: 'existing', target: header }
    })
    return mapping
  })
}

export function mergeSheetsWithMappings(sheets, mappings) {
  const headers = []
  const seenHeaders = new Set()

  const ensureHeader = (header) => {
    const cleanHeader = String(header ?? '').trim()
    if (!cleanHeader || seenHeaders.has(cleanHeader)) return
    seenHeaders.add(cleanHeader)
    headers.push(cleanHeader)
  }

  const rows = []

  sheets.forEach((sheet, sheetIndex) => {
    const mapping = mappings[sheetIndex] || {}

    sheet.headers.forEach((header) => {
      const config = mapping[header]
      if (!config) {
        ensureHeader(header)
        return
      }

      const targetHeader = String(config.target ?? '').trim() || header
      ensureHeader(targetHeader)
    })

    sheet.rows.forEach((row) => {
      const mergedRow = {}

      sheet.headers.forEach((header) => {
        const config = mapping[header]
        const targetHeader = String((config && config.target) ?? header).trim() || header
        if (!targetHeader) return
        mergedRow[targetHeader] = row[header] ?? ''
      })

      rows.push(mergedRow)
    })
  })

  return { headers, rows }
}

export function mapSheetWithMapping(sheet, mapping = {}) {
  const headers = []
  const seenHeaders = new Set()

  const ensureHeader = (header) => {
    const cleanHeader = String(header ?? '').trim()
    if (!cleanHeader || seenHeaders.has(cleanHeader)) return
    seenHeaders.add(cleanHeader)
    headers.push(cleanHeader)
  }

  sheet.headers.forEach((header) => {
    const config = mapping[header]
    const targetHeader = String((config && config.target) ?? header).trim() || header
    ensureHeader(targetHeader)
  })

  const rows = sheet.rows.map((row) => {
    const mappedRow = {}

    sheet.headers.forEach((header) => {
      const config = mapping[header]
      const targetHeader = String((config && config.target) ?? header).trim() || header
      if (!targetHeader) return
      mappedRow[targetHeader] = row[header] ?? ''
    })

    return mappedRow
  })

  return { headers, rows }
}