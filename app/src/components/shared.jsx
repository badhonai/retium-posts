import React from 'react'
import { DATA } from '../data.js'

const MARK = (
  <div className="mark">
    <svg viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3">
      <rect x="4" y="4" width="16" height="16" rx="4" />
    </svg>
  </div>
)

export function Header({ title, right, theme, toggleTheme, children }) {
  return (
    <div className="hdr">
      <div className="row">
        {MARK}
        <div className="name">retium<b>.</b>posts</div>
        {right && <div className="sub">{right}</div>}
        {toggleTheme && (
          <button className="iconbtn" onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round"><circle cx="12" cy="12" r="4.5" />
                <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3 19 19M19 5l-1.7 1.7M6.7 17.3 5 19" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {title && <div className="big">{title}</div>}
      {children}
    </div>
  )
}

// A post is either posted or ready. Retium posts ship as long-form text; images are
// optional, so there is no "needs image" state here (unlike the other projects).
function status(d, posted) {
  return posted[d.day] ? 'done' : 'ready'
}

export { status, MARK }
