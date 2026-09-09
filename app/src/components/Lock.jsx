import React, { useRef, useState } from 'react'
import { SHA, FNV } from '../data.js'

function fnv1a(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

async function sha(s) {
  if (window.crypto && crypto.subtle) {
    try {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')
    } catch { /* fall through to FNV */ }
  }
  return 'fnv:' + fnv1a(s)
}

export default function Lock({ onUnlock }) {
  const [err, setErr] = useState(false)
  const [shake, setShake] = useState(false)
  const ref = useRef(null)

  const tryUnlock = async () => {
    const got = await sha(ref.current.value)
    const hit = got === SHA || got === 'fnv:' + FNV
    if (hit) {
      localStorage.setItem('utexo_lock_v1', 'ok')
      onUnlock()
    } else {
      setErr(true); setShake(true)
      setTimeout(() => setShake(false), 450)
      ref.current.value = ''; ref.current.focus()
    }
  }

  return (
    <div id="lock" className={shake ? 'shake' : ''}>
      <div className="glyph">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round">
          <rect x="4" y="10.5" width="16" height="10" rx="3" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
      </div>
      <h1>utexo.posts</h1>
      <p>Private content dashboard — unlock to continue</p>
      <div className="field">
        <input ref={ref} type="password" placeholder="Password" autoComplete="off"
          onKeyDown={e => e.key === 'Enter' && tryUnlock()} />
        <button className="go" onClick={tryUnlock}>Unlock</button>
      </div>
      <div className={'err' + (err ? ' show' : '')}>Wrong password — try again</div>
      <div className="hint">This device stays unlocked</div>
    </div>
  )
}
