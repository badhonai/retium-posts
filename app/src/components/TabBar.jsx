import React from 'react'

export default function TabBar({ tab, setTab }) {
  return (
    <nav className="tabbar">
      <button className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
        </svg>
        Home
      </button>
      <button className={tab === 'posts' ? 'on' : ''} onClick={() => setTab('posts')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <rect x="4" y="3.5" width="16" height="17" rx="3" />
          <path d="M8.5 9h7M8.5 13h7M8.5 17h4.5" />
        </svg>
        Posts
      </button>
    </nav>
  )
}
