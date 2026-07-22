export default function SheetPreview({ headers, rows, max = 6 }) {
  if (!headers?.length) return null
  return (
    <div style={{ marginTop: 14, overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 12 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: 'var(--bg-dim)' }}>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, max).map((r, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h} style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', color: 'var(--ink-dim)', whiteSpace: 'nowrap', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(r[h] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > max && <div style={{ padding: '6px 10px', fontSize: 12, color: 'var(--ink-dim)' }}>+{rows.length - max} more row(s)</div>}
    </div>
  )
}
