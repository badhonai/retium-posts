import React, { useContext, useMemo } from 'react'
import { downloadFile, round2 } from '../data.js'
import { ToastContext } from '../toast.js'

export default function PointsSheet({ buildExport, onClose }) {
  const toast = useContext(ToastContext)
  const data = useMemo(() => buildExport(), [buildExport])
  const json = useMemo(() => JSON.stringify(data, null, 2), [data])
  const cur = data.current_week

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

        {cur && (
          <>
            <div className="ptlabel">This week — Week {cur.week}</div>
            <div className="ptsum cur">
              <div className="ptbig">
                <b>{cur.points}</b>
                <span>points this week</span>
              </div>
              <div className="ptside">
                <div><b>{cur.average}</b><span>average</span></div>
                <div><b>{cur.scored}/{cur.posts}</b><span>scored</span></div>
              </div>
            </div>
          </>
        )}

        <div className="slab label">All weeks</div>
        <div className="wkpts">
          {data.weeks.map(w => (
            <div key={w.week} className={'wkpts-row' + (cur && w.week === cur.week ? ' cur' : '') +
              (w.scored ? '' : ' none')}>
              <span className="w">W{w.week}</span>
              <span className="c">
                {w.scored ? `${w.scored} of ${w.posts} scored · avg ${w.average}` : 'not scored yet'}
              </span>
              <span className="v">{w.scored ? w.points : '—'}</span>
            </div>
          ))}
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
