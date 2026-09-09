import React, { useContext, useState } from 'react'
import { downloadFile } from '../data.js'
import { ToastContext } from '../toast.js'

export default function BackupSheet({ posted, setPosted, points, setPoints, onClose }) {
  const toast = useContext(ToastContext)
  const [importVal, setImportVal] = useState('')

  const snapshot = JSON.stringify({ v: 2, posted, points }, null, 0)

  const doExport = async () => {
    try { await navigator.clipboard.writeText(snapshot); toast('Backup copied — paste it somewhere safe ✓') }
    catch { toast('Copy blocked — select the text below manually') }
  }

  const doDownload = () => {
    if (downloadFile(`retium-backup-${new Date().toISOString().slice(0, 10)}.json`, snapshot))
      toast('Downloading backup ✓')
    else toast('Download blocked here — use Copy instead')
  }

  const doImport = () => {
    try {
      const parsed = JSON.parse(importVal)
      if (!parsed || typeof parsed !== 'object') throw new Error()
      const p = parsed.posted || parsed
      const clean = {}
      for (const [k, v] of Object.entries(p)) if (v) clean[parseInt(k, 10)] = 1
      if (!Object.keys(clean).length) throw new Error()
      setPosted(clean)
      if (parsed.points && typeof parsed.points === 'object') {
        const cp = {}
        for (const [k, v] of Object.entries(parsed.points)) {
          const n = parseFloat(v)
          if (!isNaN(n)) cp[parseInt(k, 10)] = n
        }
        setPoints(cp)
      }
      toast('Progress restored ✓')
      onClose()
    } catch { toast('That does not look like a backup — paste the JSON you exported') }
  }

  const doReset = () => {
    if (confirm('Clear ALL posted marks and scores in this browser?')) {
      setPosted({})
      setPoints({})
      toast('Cleared — scores recorded in the repo will re-seed on reload')
      onClose()
    }
  }

  return (
    <div id="sheet" className="open">
      <div className="backdrop" onClick={onClose} />
      <div className="panel">
        <div className="handle" />
        <div className="head"><h2>Backup &amp; restore</h2></div>
        <div className="sub">
          <span className="pill">{Object.keys(posted).length} days posted</span>
          <span className="pill">{Object.keys(points).length} scores saved</span>
        </div>

        <p style={{ color: 'var(--dim)', fontSize: 13.5, marginBottom: 14 }}>
          Posted marks and scores live in this browser and survive new weeks and deployments
          automatically. Make a backup to move them to another device, or restore one here.
        </p>

        <div className="acts">
          <button className="btn pri blk" onClick={doExport}>📤 Copy backup JSON</button>
          <button className="btn sec blk" onClick={doDownload}>⬇️ Download .json</button>
        </div>

        <div className="slab label">Restore from backup</div>
        <textarea className="posttext" style={{ minHeight: 90, userSelect: 'text' }}
          placeholder="Paste a backup JSON here…" value={importVal}
          onChange={e => setImportVal(e.target.value)} />
        <div className="acts" style={{ marginTop: 10 }}>
          <button className="btn sec blk" onClick={doImport}>📥 Restore</button>
          <button className="btn sec blk" style={{ color: 'var(--red)' }} onClick={doReset}>
            Reset everything
          </button>
        </div>
      </div>
    </div>
  )
}
