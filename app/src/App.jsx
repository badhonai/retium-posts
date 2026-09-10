import React, { useEffect, useState, useCallback } from 'react'
import Lock from './components/Lock.jsx'
import Home from './components/Home.jsx'
import Posts from './components/Posts.jsx'
import DetailSheet from './components/DetailSheet.jsx'
import BackupSheet from './components/BackupSheet.jsx'
import PointsSheet from './components/PointsSheet.jsx'
import TabBar from './components/TabBar.jsx'
import { DATA, round2, LS } from './data.js'
import { ToastContext } from './toast.js'

const K_POSTED = 'retium_posted_v1'   // day-keyed -> survives new weeks & deployments
const K_POINTS = 'retium_points_v1'   // day-keyed -> { base, accuracy, originality, ... }
const K_LOCK = 'retium_lock_v1'
const K_THEME = 'retium_theme_v1'

export default function App() {
  const [theme, setTheme] = useState(() => LS.get(K_THEME, 'dark'))
  const [unlocked, setUnlocked] = useState(() => LS.get(K_LOCK) === 'ok')

  const [posted, setPosted] = useState(() => {
    // only keep marks for days that actually exist in the repo -> counts always match reality
    try {
      const raw = JSON.parse(LS.get(K_POSTED, '{}'))
      const valid = new Set(DATA.map(d => d.day))
      const clean = {}
      for (const [k, v] of Object.entries(raw)) {
        const day = parseInt(k, 10)
        if (v && valid.has(day)) clean[day] = 1
      }
      return clean
    } catch { return {} }
  })

  // Points: one number per post, keyed by day exactly like posted marks. Any score
  // already recorded in the post file seeds the entry the first time the app runs, so
  // the repo's real scorer results show up immediately and stay editable afterwards.
  const [points, setPoints] = useState(() => {
    try {
      const raw = JSON.parse(LS.get(K_POINTS, '{}'))
      const clean = {}
      for (const d of DATA) {
        const n = parseFloat(raw[d.day])
        if (!isNaN(n)) { clean[d.day] = n; continue }
        if (typeof d.seed === 'number') clean[d.day] = d.seed   // seed from the repo file
      }
      return clean
    } catch {
      const clean = {}
      for (const d of DATA) if (typeof d.seed === 'number') clean[d.day] = d.seed
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

  useEffect(() => { LS.set(K_POSTED, JSON.stringify(posted)) }, [posted])
  useEffect(() => { LS.set(K_POINTS, JSON.stringify(points)) }, [points])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    LS.set(K_THEME, theme)
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

  // Bulk marking: apply a posted/unposted state to every post in one or more whole
  // weeks at once. Weeks are whatever they are (a week holds however many posts it
  // has), so this never assumes a fixed posts-per-week number.
  const markWeeks = useCallback((weeks, value) => {
    const sel = new Set(weeks)
    if (!sel.size) return
    const days = DATA.filter(d => sel.has(d.week))
    const changed = days.filter(d => value ? !posted[d.day] : !!posted[d.day]).length
    setPosted(p => {
      const n = { ...p }
      for (const d of days) { if (value) n[d.day] = 1; else delete n[d.day] }
      return n
    })
    const w = sel.size === 1 ? `week ${[...sel][0]}` : `${sel.size} weeks`
    showToast(changed
      ? `${changed} post${changed === 1 ? '' : 's'} ${value ? 'marked as posted ✓' : 'cleared'} · ${w}`
      : `Nothing to change · ${w}`)
  }, [posted, showToast])

  const savePoints = useCallback((day, value) => {
    setPoints(p => {
      const n = { ...p }
      const v = parseFloat(value)
      if (value === '' || value === null || isNaN(v)) delete n[day]
      else n[day] = v
      return n
    })
  }, [])

  // Export: one row per post, each carrying a stable id so a number in the JSON can
  // always be traced back to an exact post. Totals are reported per week — the
  // dashboard never shows one running grand total.
  const buildExport = useCallback(() => {
    const rows = DATA.map(d => ({
      id: d.id,                       // e.g. w1-d04-fee-model-developer-guide
      day: d.day,
      week: d.week,
      slug: d.slug,
      title: d.title,
      type: d.ptype,
      requirement: d.req,
      posted: !!posted[d.day],
      points: points[d.day] === undefined ? null : points[d.day],
    }))
    const weekNums = [...new Set(DATA.map(d => d.week))].sort((a, b) => a - b)
    const weeks = weekNums.map(w => {
      const rs = rows.filter(r => r.week === w)
      const sc = rs.filter(r => r.points !== null)
      const sum = round2(sc.reduce((s, r) => s + r.points, 0))
      return {
        week: w,
        posts: rs.length,
        posted: rs.filter(r => r.posted).length,
        scored: sc.length,
        points: sum,
        average: sc.length ? round2(sum / sc.length) : 0,
      }
    })
    const scoredAll = rows.filter(r => r.points !== null)
    const sumAll = round2(scoredAll.reduce((s, r) => s + r.points, 0))
    return {
      project: 'retium-posts',
      exported: new Date().toISOString().slice(0, 10),
      current_week: weeks[weeks.length - 1] || null,
      weeks,
      totals: {
        posts: rows.length,
        posted: rows.filter(r => r.posted).length,
        scored: scoredAll.length,
        points: sumAll,
        average: scoredAll.length ? round2(sumAll / scoredAll.length) : 0,
      },
      posts: rows,
    }
  }, [points, posted])

  if (!unlocked) return <Lock onUnlock={() => setUnlocked(true)} />

  const goPosts = (w) => { setWeekFilter(w); setTab('posts') }

  return (
    <ToastContext.Provider value={showToast}>
      <div id="app">
        {tab === 'home'
          ? <Home posted={posted} points={points} onOpenDay={setOpenDay}
              goPosts={goPosts} theme={theme} toggleTheme={toggleTheme} />
          : <Posts posted={posted} points={points} weekFilter={weekFilter}
              setWeekFilter={setWeekFilter} onOpenDay={setOpenDay}
              onMarkWeeks={markWeeks}
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
