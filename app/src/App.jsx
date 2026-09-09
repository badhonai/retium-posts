import React, { useEffect, useState, useCallback } from 'react'
import Lock from './components/Lock.jsx'
import Home from './components/Home.jsx'
import Posts from './components/Posts.jsx'
import DetailSheet from './components/DetailSheet.jsx'
import BackupSheet from './components/BackupSheet.jsx'
import PointsSheet from './components/PointsSheet.jsx'
import TabBar from './components/TabBar.jsx'
import { DATA, CATS, SCHEME, round2, totalOf } from './data.js'
import { ToastContext } from './toast.js'

const K_POSTED = 'retium_posted_v1'   // day-keyed -> survives new weeks & deployments
const K_POINTS = 'retium_points_v1'   // day-keyed -> { base, accuracy, originality, ... }
const K_LOCK = 'retium_lock_v1'
const K_THEME = 'retium_theme_v1'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(K_THEME) || 'dark')
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(K_LOCK) === 'ok')

  const [posted, setPosted] = useState(() => {
    // only keep marks for days that actually exist in the repo -> counts always match reality
    try {
      const raw = JSON.parse(localStorage.getItem(K_POSTED) || '{}')
      const valid = new Set(DATA.map(d => d.day))
      const clean = {}
      for (const [k, v] of Object.entries(raw)) {
        const day = parseInt(k, 10)
        if (v && valid.has(day)) clean[day] = 1
      }
      return clean
    } catch { return {} }
  })

  // Points are keyed by day, exactly like posted marks. Any score already recorded
  // in the post file seeds the entry the first time the app runs, so the repo's
  // real scorer results show up immediately and stay editable afterwards.
  const [points, setPoints] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(K_POINTS) || '{}')
      const clean = {}
      for (const d of DATA) {
        const v = raw[d.day]
        if (v && typeof v === 'object') {
          const o = {}
          for (const c of CATS) {
            const n = parseFloat(v[c])
            if (!isNaN(n)) o[c] = n
          }
          if (Object.keys(o).length) { clean[d.day] = o; continue }
        }
        if (d.seed) clean[d.day] = { ...d.seed }   // seed from the repo file
      }
      return clean
    } catch {
      const clean = {}
      for (const d of DATA) if (d.seed) clean[d.day] = { ...d.seed }
      return clean
    }
  })

  const [tab, setTab] = useState('home')
  const [weekFilter, setWeekFilter] = useState(0)
  const [openDay, setOpenDay] = useState(null)      // number | 'backup' | 'points' | null
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(showToast._h)
    showToast._h = setTimeout(() => setToast(null), 1600)
  }, [])

  useEffect(() => { localStorage.setItem(K_POSTED, JSON.stringify(posted)) }, [posted])
  useEffect(() => { localStorage.setItem(K_POINTS, JSON.stringify(points)) }, [points])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(K_THEME, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const markPosted = useCallback((day) => {
    setPosted(p => {
      const n = { ...p }
      if (n[day]) { delete n[day]; showToast('Marked as not posted') }
      else { n[day] = 1; showToast('Marked as posted ✓') }
      return n
    })
  }, [showToast])

  const savePoints = useCallback((day, obj) => {
    setPoints(p => {
      const n = { ...p }
      const clean = {}
      for (const c of CATS) {
        const v = parseFloat(obj[c])
        if (!isNaN(v)) clean[c] = v
      }
      if (Object.keys(clean).length) n[day] = clean
      else delete n[day]
      return n
    })
  }, [])

  // The export: one row per post, each carrying a stable id so a number in the
  // JSON can always be traced back to an exact post.
  const buildExport = useCallback(() => {
    const rows = DATA.map(d => {
      const p = points[d.day] || null
      return {
        id: d.id,                       // e.g. w1-d04-fee-model-developer-guide
        day: d.day,
        week: d.week,
        slug: d.slug,
        title: d.title,
        type: d.ptype,
        requirement: d.req,
        posted: !!posted[d.day],
        points: p ? { ...p, total: totalOf(p) } : null,
      }
    })
    const scored = rows.filter(r => r.points)
    const sum = round2(scored.reduce((s, r) => s + r.points.total, 0))
    return {
      project: 'retium-posts',
      exported: new Date().toISOString().slice(0, 10),
      points_scheme: SCHEME,
      totals: {
        posts: rows.length,
        posted: rows.filter(r => r.posted).length,
        scored: scored.length,
        points: sum,
        average: scored.length ? round2(sum / scored.length) : 0,
        best: scored.length
          ? scored.reduce((a, b) => (b.points.total > a.points.total ? b : a)).id
          : null,
      },
      posts: rows,
    }
  }, [points, posted])

  if (!unlocked) return <Lock onUnlock={() => setUnlocked(true)} />

  const goPosts = (w) => { setWeekFilter(w); setTab('posts') }
  const totals = buildExport().totals

  return (
    <ToastContext.Provider value={showToast}>
      <div id="app">
        {tab === 'home'
          ? <Home posted={posted} points={points} totals={totals} onOpenDay={setOpenDay}
              goPosts={goPosts} theme={theme} toggleTheme={toggleTheme} />
          : <Posts posted={posted} points={points} weekFilter={weekFilter}
              setWeekFilter={setWeekFilter} onOpenDay={setOpenDay}
              theme={theme} toggleTheme={toggleTheme} />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
      {openDay === 'backup' &&
        <BackupSheet posted={posted} setPosted={setPosted} points={points}
          setPoints={setPoints} onClose={() => setOpenDay(null)} />}
      {openDay === 'points' &&
        <PointsSheet buildExport={buildExport} onClose={() => setOpenDay(null)} />}
      {typeof openDay === 'number' &&
        <DetailSheet day={openDay} posted={posted} onMark={markPosted}
          points={points} onSavePoints={savePoints} onClose={() => setOpenDay(null)} />}
      <div id="toast" className={toast ? 'show' : ''}>{toast || ''}</div>
    </ToastContext.Provider>
  )
}
