import React, { useMemo, useState } from 'react'
import { DATA, esc } from '../data.js'
import { Header, status } from './shared.jsx'

const MAXW = Math.max(...DATA.map(d => d.week))
const BADGE = { done: '✓ POSTED', ready: 'READY' }

export default function Posts({ posted, points, weekFilter, setWeekFilter, onOpenDay, onMarkWeeks, theme, toggleTheme }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(() => new Set())   // weeks ticked in the bulk panel
  const [bulkOpen, setBulkOpen] = useState(false)

  const toggleSel = (w) => setSel(s => {
    const n = new Set(s)
    n.has(w) ? n.delete(w) : n.add(w)
    return n
  })

  // Every real week in the repo, in order. No synthetic empty weeks.
  const weeks = [...new Set(DATA.map(d => d.week))].sort((a, b) => a - b)
  const allSel = sel.size === weeks.length
  const apply = (value) => { onMarkWeeks([...sel], value); setSel(new Set()) }

  const list = useMemo(() =>
    DATA
      .filter(d => !weekFilter || d.week === weekFilter)
      .filter(d => !q || (d.title + d.post + d.ptype).toLowerCase().includes(q.toLowerCase())),
    [weekFilter, q, posted])

  return (
    <div className="view on" id="v-posts">
      <Header right={DATA.length + ' posts'} theme={theme} toggleTheme={toggleTheme} />
      <div style={{ height: 16 }} />
      <div className="search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search posts" />
      </div>
      <div className="chips">
        <div className={'chip' + (!weekFilter ? ' on' : '')} onClick={() => setWeekFilter(0)}>
          All <span className="n">{DATA.length}</span>
        </div>
        {Array.from({ length: MAXW }, (_, i) => i + 1).map(w => {
          const n = DATA.filter(d => d.week === w).length
          return (
            <div key={w} className={'chip' + (weekFilter === w ? ' on' : '')} onClick={() => setWeekFilter(w)}>
              Week {w} <span className="n">{n}</span>
            </div>
          )
        })}
      </div>
      <div className="card bulk fade">
        <div className="bulk-top" onClick={() => setBulkOpen(o => !o)}>
          <b>☑︎ Bulk mark</b>
          <span>{sel.size ? `${sel.size} week${sel.size === 1 ? '' : 's'} selected` : 'mark whole weeks at once'}</span>
          <i className={'chev ' + (bulkOpen ? 'open' : '')}>›</i>
        </div>
        {bulkOpen && (
          <>
            <div className="chips bulk-chips">
              {weeks.map(w => {
                const days = DATA.filter(d => d.week === w)
                const dn = days.filter(d => posted[d.day]).length
                const full = dn === days.length
                return (
                  <div key={w} className={'chip' + (sel.has(w) ? ' on' : '')} onClick={() => toggleSel(w)}>
                    <span className="tick">{sel.has(w) ? '✓' : ''}</span>
                    W{w}
                    <span className="n" style={full ? { color: 'var(--brand)' } : undefined}>{dn}/{days.length}</span>
                  </div>
                )
              })}
            </div>
            <div className="acts bulk-acts">
              <button className="btn ok" disabled={!sel.size} onClick={() => apply(true)}>
                ✓ Mark {sel.size || ''} week{sel.size === 1 ? '' : 's'} posted
              </button>
              <button className="btn sec" disabled={!sel.size} onClick={() => apply(false)}>
                Clear
              </button>
              <button className="btn sec" onClick={() => setSel(allSel ? new Set() : new Set(weeks))}>
                {allSel ? 'None' : 'All'}
              </button>
            </div>
          </>
        )}
      </div>

      {!list.length ? <div className="empty">Nothing matches.</div> : list.map(d => {
        const st = status(d, posted)
        const p = points[d.day]
        return (
          <div className="card prow fade" key={d.day} onClick={() => onOpenDay(d.day)}>
            {d.img
              ? <img className="th" src={d.thumb} loading="lazy" alt="" />
              : <div className="th ph">{d.day}</div>}
            <div className="mid">
              <div className="t">Day {d.day} · {esc(d.title)}</div>
              <div className="s">W{d.week} · {d.ptype} · {d.req} · {d.post.length}c</div>
            </div>
            {p !== undefined
              ? <div className="badge done pts">{p} pts</div>
              : <div className={'badge ' + st}>{BADGE[st]}</div>}
          </div>
        )
      })}
    </div>
  )
}
