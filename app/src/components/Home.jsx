import React, { useContext } from 'react'
import { DATA, esc, round2, totalOf } from '../data.js'
import { ToastContext } from '../toast.js'
import { Header, status } from './shared.jsx'

const MAXW = Math.max(...DATA.map(d => d.week))

export default function Home({ posted, points, totals, onOpenDay, goPosts, theme, toggleTheme }) {
  const toast = useContext(ToastContext)
  // A week is however many posts it has; it closes when the next week opens. The denominator
  // is the real post count, never weeks x 7. No empty slots, no "missing" week, ever.
  const total = DATA.length                                     // every post that exists
  const done = DATA.filter(d => posted[d.day]).length           // real posts, never stale keys
  const left = total - done
  const pct = total ? Math.round(done / total * 100) : 0        // always 0..100
  const next = DATA.find(d => !posted[d.day])
  const scored = DATA.filter(d => points[d.day]).length

  const copyPost = async (d) => {
    try { await navigator.clipboard.writeText(d.post); toast('Copied to clipboard ✓') }
    catch { toast('Copy blocked — open the post and copy manually') }
  }

  const C = 2 * Math.PI * 40
  const allDone = !next
  const hero = allDone ? (
    <div className="card hero fade">
      <div className="body done-body">
        <div className="done-emoji">✓</div>
        <h3>All caught up</h3>
        <p>Every post is published.</p>
      </div>
    </div>
  ) : (
    <div className="card hero fade">
      <div className="body">
        <div className="label">Next up</div>
        <h3 dangerouslySetInnerHTML={{ __html: esc(next.title) }} />
        <div className="ptype">{next.ptype} · {next.req}</div>
        <div className="acts">
          <button className="btn pri" onClick={() => copyPost(next)}>📋 Copy text</button>
          <button className="btn ok" onClick={() => onOpenDay(next.day)}>✓ Done</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="view on" id="v-home">
      <Header title="Home" right={done + '/' + total} theme={theme} toggleTheme={toggleTheme}>
        <div className="hdrbtns">
          <button className="btn sec" onClick={() => onOpenDay('points')}>🏆 Points &amp; export</button>
          <button className="btn sec" onClick={() => onOpenDay('backup')}>Backup &amp; restore</button>
        </div>
      </Header>

      <div style={{ height: 18 }} />

      <div className="card prog fade">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="41" fill="none" stroke="var(--card2)" strokeWidth="7" />
          <circle cx="48" cy="48" r="41" fill="none" stroke="var(--grn)" strokeWidth="7"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)}
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }} />
          <text x="48" y="49" textAnchor="middle" fill="var(--tx)" fontSize="18" fontWeight="800"
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {done}/{total}
          </text>
          <text x="48" y="63" textAnchor="middle" fill="var(--dim)" fontSize="10" fontWeight="600">
            posted
          </text>
        </svg>
        <div className="prog-side">
          <div className="prog-big">{left} left</div>
          <div className="prog-sub">of {total} posts, all weeks combined</div>
          <div className="bar"><i style={{ width: pct + '%' }} /></div>
        </div>
      </div>

      <div className="stats">
        <div className="card stat fade">
          <b>{done}<span className="of">/{total}</span></b><span>posted</span>
        </div>
        <div className="card stat fade">
          <b className={left ? 'warm' : 'good'}>{left}</b><span>left</span>
        </div>
        <div className="card stat fade">
          <b>{round2(totals.points)}</b><span>points · {scored} scored</span>
        </div>
      </div>

      <div className="sect"><h2>Next up</h2><span>{pct}% complete</span></div>
      {hero}

      <div className="sect" style={{ marginTop: 22 }}><h2>Weeks</h2><span>{MAXW} weeks · {total} posts</span></div>
      {Array.from({ length: MAXW }, (_, i) => i + 1).map(w => {
        const days = DATA.filter(d => d.week === w)
        if (!days.length) {
          return (
            <div className="card wk ghost fade" key={w}>
              <div className="wn">W{w}</div>
              <div className="mid"><div className="meta">no posts yet</div></div>
              <div className="chev">→</div>
            </div>
          )
        }
        const dn = days.filter(d => posted[d.day]).length
        const wp = round2(days.reduce((s, d) => s + totalOf(points[d.day]), 0))
        const ws = days.filter(d => points[d.day]).length
        return (
          <div className="card wk fade" key={w} onClick={() => goPosts(w)}>
            <div className="wn">W{w}</div>
            <div className="mid">
              <div className="dots">
                {days.map(d => <div key={d.day} className={'dot ' + status(d, posted)} title={'Day ' + d.day} />)}
              </div>
              <div className="meta">
                <b>{dn}/{days.length} posted</b><span className="sep">·</span>
                {ws ? `${wp} pts (${ws} scored)` : 'not scored'}
              </div>
            </div>
            <div className="chev">→</div>
          </div>
        )
      })}
    </div>
  )
}
