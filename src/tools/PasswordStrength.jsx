import { useMemo, useState } from 'react'

function scorePassword(pw) {
  if (!pw) return { score: 0, label: '', feedback: [] }
  let score = 0
  const feedback = []
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasDigit = /\d/.test(pw)
  const hasSymbol = /[^A-Za-z0-9]/.test(pw)
  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length

  if (pw.length >= 8) score += 1; else feedback.push('Use at least 8 characters')
  if (pw.length >= 12) score += 1; else feedback.push('12+ characters is stronger')
  if (variety >= 3) score += 1; else feedback.push('Mix uppercase, lowercase, numbers, and symbols')
  if (variety === 4) score += 1
  if (!/(.)\1{2,}/.test(pw)) score += 1; else feedback.push('Avoid repeating characters')

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)], feedback }
}

export default function PasswordStrength() {
  const [pw, setPw] = useState('')
  const { score, label, feedback } = useMemo(() => scorePassword(pw), [pw])
  const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#0071e3']

  return (
    <div className="tool-body">
      <label className="label">Password</label>
      <input className="field" type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Type a password to check…" />

      {pw && (
        <>
          <div className="strength-meter">
            <div className="strength-fill" style={{ width: `${(score + 1) * 20}%`, background: colors[score] }} />
          </div>
          <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14, color: colors[score] }}>{label}</div>
          {feedback.length > 0 && (
            <ul style={{ marginTop: 10, paddingLeft: 18, fontSize: 13, color: 'var(--ink-dim)' }}>
              {feedback.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
        </>
      )}
      <div className="hint-text" style={{ marginTop: 14 }}>Checked entirely in your browser — nothing is sent anywhere.</div>
    </div>
  )
}
