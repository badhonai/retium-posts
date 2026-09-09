import React, { useContext, useEffect, useState } from 'react'
import { DATA, CATS, LABEL, SCHEME, esc, round2, totalOf } from '../data.js'
import { ToastContext } from '../toast.js'
import { status } from './shared.jsx'

const BADGE = { done: '✓ POSTED', ready: 'READY' }
const BCOLOR = { done: 'var(--grn)', ready: 'var(--blue)' }

export default function DetailSheet({ day, posted, onMark, points, onSavePoints, onClose }) {
  const toast = useContext(ToastContext)
  const d = DATA.find(x => x.day === day)
  const st = status(d, posted)
  const saved = points[day] || null

  const [form, setForm] = useState(() => {
    const o = {}
    for (const c of CATS) o[c] = saved && saved[c] !== undefined ? String(saved[c]) : ''
    return o
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // reset the form if the sheet is opened for a different day
  useEffect(() => {
    const o = {}
    for (const c of CATS) o[c] = saved && saved[c] !== undefined ? String(saved[c]) : ''
    setForm(o)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  const liveTotal = round2(CATS.reduce((s, c) => s + (parseFloat(form[c]) || 0), 0))

  const copyPost = async () => {
    try { await navigator.clipboard.writeText(d.post); toast('Copied to clipboard ✓') }
    catch {
      const ta = document.createElement('textarea')
      ta.value = d.post; document.body.appendChild(ta); ta.select()
      let ok = false; try { ok = document.execCommand('copy') } catch { /* noop */ }
      ta.remove()
      toast(ok ? 'Copied to clipboard ✓' : 'Copy blocked — select the text manually')
    }
  }

  const save = () => {
    onSavePoints(day, form)
    toast(liveTotal ? `Saved — ${liveTotal} points` : 'Score cleared')
  }

  const clear = () => { setForm(Object.fromEntries(CATS.map(c => [c, '']))); onSavePoints(day, {}) }

  return (
    <div id="sheet" className="open">
      <div className="backdrop" onClick={onClose} />
      <div className="panel">
        <div className="handle" />
        <div className="head"><h2>Day {d.day} · {esc(d.title)}</h2></div>
        <div className="sub">
          <span className="pill">Week {d.week}</span>
          <span className="pill">{d.ptype}</span>
          <span className="pill">{d.req}</span>
          <span className="pill" style={{ color: BCOLOR[st] }}>{BADGE[st]}</span>
          <span className="pill mono">{d.id}</span>
          <a href={`https://github.com/badhonai/retium-posts/blob/main/posts/week-${String(d.week).padStart(2, '0')}/${d.file}`}
            target="_blank" rel="noreferrer">open in repo ↗</a>
        </div>

        <div className="acts">
          <button className="btn pri blk" onClick={copyPost}>📋 Copy post text</button>
          <div className="row2">
            <button className={'btn ' + (posted[d.day] ? 'ok' : 'sec')} onClick={() => onMark(d.day)}>
              {posted[d.day] ? '✓ Posted — undo' : 'Mark as posted'}
            </button>
          </div>
        </div>

        <div className="slab label">Score</div>
        <div className="ptform">
          {CATS.map(c => (
            <label className="ptrow" key={c}>
              <span>{LABEL[c]}<i>max {SCHEME[c]}</i></span>
              <input type="number" step="0.01" min="0" max={SCHEME[c]} inputMode="decimal"
                placeholder="—" value={form[c]}
                onChange={e => setForm(f => ({ ...f, [c]: e.target.value }))} />
            </label>
          ))}
          <div className="ptrow total">
            <span>Total</span>
            <b className="mono">{liveTotal || '—'}</b>
          </div>
        </div>
        <div className="acts" style={{ marginTop: 10 }}>
          <button className="btn ok blk" onClick={save}>💾 Save score</button>
          <button className="btn sec blk" onClick={clear}>Clear</button>
        </div>
        {d.seed && (
          <p className="hint">
            A score for this post is also recorded in the repo file
            ({Object.entries(d.seed).map(([k, v]) => `${LABEL[k]} ${v}`).join(' · ')},
            total {totalOf(d.seed)}). Editing here updates your live copy only — it does not
            rewrite the post file.
          </p>
        )}

        <div className="slab label">Post</div>
        <div className="posttext">{d.post}</div>
        {d.visual && <><div className="slab label">Visual notes</div><div className="note">{d.visual}</div></>}
        {d.facts && <><div className="slab label">Facts &amp; sources</div><div className="note facts">{d.facts}</div></>}
      </div>
    </div>
  )
}
