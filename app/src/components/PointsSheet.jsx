import React, { useContext, useMemo } from 'react'
import { CATS, LABEL, SCHEME, downloadFile, round2, totalOf } from '../data.js'
import { ToastContext } from '../toast.js'

export default function PointsSheet({ buildExport, onClose }) {
  const toast = useContext(ToastContext)
  const data = useMemo(() => buildExport(), [buildExport])
  const json = useMemo(() => JSON.stringify(data, null, 2), [data])

  // per-category totals across every scored post - shows where points are leaking
  const byCat = useMemo(() => {
    const rows = data.posts.filter(p => p.points)
    return CATS.map(c => ({
      key: c,
      got: round2(rows.reduce((s, r) => s + (r.points[c] || 0), 0)),
      max: SCHEME[c] * rows.length,
    }))
  }, [data])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      toast('Points JSON copied ✓')
    } catch { toast('Copy blocked — select the text below and copy manually') }
  }

  const download = () => {
    if (downloadFile(`retium-points-${data.exported}.json`, json)) toast('Downloading JSON ✓')
    else toast('Download blocked here — use the Copy button instead')
  }

  return (
    <div id="sheet" className="open">
      <div className="backdrop" onClick={onClose} />
      <div className="panel">
        <div className="handle" />
        <div className="head"><h2>Points</h2></div>
        <div className="sub">
          <span className="pill">{data.totals.scored} of {data.totals.posts} scored</span>
          <span className="pill">{data.totals.posted} posted</span>
        </div>

        <div className="ptsum">
          <div className="ptbig">
            <b>{data.totals.points}</b>
            <span>total points</span>
          </div>
          <div className="ptside">
            <div><b>{data.totals.average}</b><span>average</span></div>
            <div><b>{data.totals.best ? data.posts.find(p => p.id === data.totals.best).day : '—'}</b><span>best day</span></div>
          </div>
        </div>

        <div className="slab label">Points by category</div>
        <div className="ptcats">
          {byCat.map(c => {
            const pct = c.max ? Math.round(c.got / c.max * 100) : 0
            return (
              <div className="ptcat" key={c.key}>
                <div className="ptcat-top">
                  <span>{LABEL[c.key]}</span>
                  <span className="mono">{c.got}<i>/{c.max}</i></span>
                </div>
                <div className="bar"><i style={{ width: pct + '%' }} /></div>
              </div>
            )
          })}
        </div>

        <div className="acts">
          <button className="btn pri blk" onClick={copy}>📋 Copy points JSON</button>
          <button className="btn sec blk" onClick={download}>⬇️ Download .json</button>
        </div>

        <div className="slab label">Exported JSON — every row carries its post id</div>
        <textarea className="posttext" style={{ minHeight: 150, userSelect: 'text', fontSize: 12 }}
          readOnly value={json} />
      </div>
    </div>
  )
}
