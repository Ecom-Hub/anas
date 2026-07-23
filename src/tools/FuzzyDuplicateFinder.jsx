import { useEffect, useState } from 'react'
import MultiFilePicker from './MultiFilePicker'
import { useMergedSheet } from './useMergedSheet'

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}
function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length) || 1
  return 1 - levenshtein(a, b) / maxLen
}

export default function FuzzyDuplicateFinder() {
  const { files, sheets, activeSheetIndex, setActiveSheetIndex, headers, rows, busy, addFiles, removeFile } = useMergedSheet()
  const [column, setColumn] = useState('')
  const [threshold, setThreshold] = useState(0.85)
  const [groups, setGroups] = useState(null)

  useEffect(() => { if (headers.length) setColumn(headers.find((h) => /name/i.test(h)) || headers[0]) }, [headers])

  const process = () => {
    const values = rows.map((r) => String(r[column] ?? '').trim()).filter(Boolean)
    const used = new Array(values.length).fill(false)
    const out = []
    for (let i = 0; i < values.length; i++) {
      if (used[i]) continue
      const group = [values[i]]
      used[i] = true
      for (let j = i + 1; j < values.length; j++) {
        if (used[j]) continue
        if (values[i].toLowerCase() !== values[j].toLowerCase() && similarity(values[i].toLowerCase(), values[j].toLowerCase()) >= threshold) {
          group.push(values[j]); used[j] = true
        }
      }
      if (group.length > 1) out.push(group)
    }
    setGroups(out)
  }

  return (
    <div className="tool-body">
      <MultiFilePicker id="fuzzy-input" files={files} sheets={sheets} activeSheetIndex={activeSheetIndex} busy={busy} onAdd={addFiles} onRemove={removeFile} onSelectSheet={setActiveSheetIndex} />

      {headers.length > 0 && (
        <>
          <div className="row" style={{ marginTop: 14 }}>
            <div style={{ flex: 1 }}>
              <label className="label">Column to check</label>
              <select className="field" value={column} onChange={(e) => setColumn(e.target.value)}>
                {headers.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label className="label">Similarity threshold: {Math.round(threshold * 100)}%</label>
            <input type="range" min="0.7" max="0.98" step="0.01" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} style={{ width: '100%' }} />
            <div className="hint-text">Lower = catches more (but more false positives). Small lists only — this checks every pair.</div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={rows.length > 3000} onClick={process}>Find near-duplicates</button>
          </div>
          {rows.length > 3000 && <div className="error-text">List is large ({rows.length} rows) — this tool works best under ~3000 rows.</div>}
        </>
      )}

      {groups && (
        <div className="result-box">
          {groups.length === 0 ? 'No near-duplicates found.' : groups.map((g, i) => `Group ${i + 1}: ${g.join('  ~  ')}`).join('\n')}
        </div>
      )}
    </div>
  )
}
