import posts from './data.json'

export const DATA = posts.data
export const SHA = posts.sha
export const FNV = posts.fnv

// Retium scoring scheme (Community Contribution Program).
// The five categories the scorer returns, in display order.
export const CATS = ['base', 'accuracy', 'originality', 'engagement', 'consistency']
export const SCHEME = { base: 30, accuracy: 30, originality: 20, engagement: 15, consistency: 15 }
export const LABEL = {
  base: 'Base',
  accuracy: 'Accuracy',
  originality: 'Originality',
  engagement: 'Engagement',
  consistency: 'Consistency',
}

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100
export const totalOf = (p) => (p ? round2(CATS.reduce((s, c) => s + (parseFloat(p[c]) || 0), 0)) : 0)

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// localStorage throws inside a sandboxed iframe (no allow-same-origin), which is how
// the file preview renders. Every access goes through these so the dashboard still
// runs there - it just cannot persist.
export const LS = {
  get(k, d = null) {
    try { const v = localStorage.getItem(k); return v === null ? d : v } catch { return d }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); return true } catch { return false }
  },
}

// Trigger a file download without leaving the page. Wrapped because sandboxed
// iframes can block it — callers must also offer a copy-to-clipboard fallback.
export function downloadFile(name, text) {
  try {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch { return false }
}
