import React, { useContext, useEffect, useState } from 'react'
import { DATA, esc } from '../data.js'
import { ToastContext } from '../toast.js'
import { status } from './shared.jsx'

const BADGE = { done: '✓ POSTED', ready: 'READY' }
const BCOLOR = { done: 'var(--brand)', ready: 'var(--blue)' }

export default function DetailSheet({ day, posted, onMark, points, onSavePoints, onClose }) {
  const toast = useContext(ToastContext)
  const d = DATA.find(x => x.day === day)
  const st = status(d, posted)
  const saved = points[day]

  const [val, setVal] = useState(() => (saved === undefined ? '' : String(saved)))

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // reset when the sheet is opened for a different day
  useEffect(() => {
    setVal(saved === undefined ? '' : String(saved))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

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
    onSavePoints(day, val)
    toast(val === '' ? 'Score cleared' : `Saved — ${val} points`)
  }

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
        <div className="ptrow">
          <span>Points scored</span>
          <input type="number" step="0.01" min="0" max="110" inputMode="decimal"
            placeholder="—" value={val}
            onChange={e => setVal(e.target.value)} />
        </div>
        <div className="acts" style={{ marginTop: 10 }}>
          <button className="btn ok blk" onClick={save}>💾 Save score</button>
          {val !== '' && <button className="btn sec blk" onClick={() => { setVal(''); onSavePoints(day, '') }}>Clear</button>}
        </div>
        {typeof d.seed === 'number' && (
          <p className="hint">
            {d.seed} points for this post are also recorded in the repo file.
            Editing here updates your live copy only — it does not rewrite the post.
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
