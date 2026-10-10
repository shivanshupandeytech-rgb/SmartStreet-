import { useState } from 'react'
import { Camera, Wrench } from 'lucide-react'
import ApiState from '../components/State'
import RiskBadge from '../components/RiskBadge'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { pct } from '../utils/risk'

function PhotoCheck() {
  const [res, setRes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setErr(''); setRes(null)
    try { setRes(await api.analyzeImage(file)) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <section className="glass h-fit rounded-2xl p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Camera size={16} /> Photo check</h2>
      <p className="mb-3 mt-1 text-xs text-gray-600">Upload a night-time photo of a pole. The check looks for a lit lamp.</p>
      <input type="file" accept="image/*" onChange={onFile} className="field" aria-label="Upload streetlight photo" />
      {busy && <p className="mt-3 text-xs text-gray-600">Analysing...</p>}
      {err && <p className="mt-3 text-xs text-bad">{err}</p>}
      {res && (res.error || res.message
        ? <p className="mt-3 text-xs text-bad">{res.error || res.message}</p>
        : <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm" aria-live="polite">
            <b style={{ color: res.lamp_state === 'lit' ? '#166534' : '#991B1B' }}>Lamp looks {res.lamp_state}</b>
            <div className="mt-1 text-xs text-gray-600">{res.bright_regions} bright region(s), confidence {pct(res.confidence)}</div>
            <div className="mt-1 text-xs text-gray-500">{res.note}</div>
          </div>)}
    </section>
  )
}

export default function Maintenance() {
  const res = useApi(api.maintenance)
  const [busyId, setBusyId] = useState(null)
  const done = async (id) => { setBusyId(id); try { await api.complete(id); res.reload() } finally { setBusyId(null) } }
  const failed = res.data?.filter((l) => l.risk_level === 'FAILED').length ?? 0

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
      <p className="mb-4 text-sm text-gray-600">Outages first, then the streetlights most likely to fail next. Marking one as serviced resets its service clock and re-scores it.</p>
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <ApiState {...res}>
          <section className="glass rounded-2xl p-2">
            <div className="px-3 py-2 text-xs text-gray-600">{res.data?.length} jobs, {failed} outages</div>
            <ul className="max-h-[75vh] divide-y divide-white/70 overflow-y-auto">
              {res.data?.map((l, i) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
                  <span className="w-7 text-sm tabular-nums text-gray-500">{i + 1}</span>
                  <div className="min-w-[10rem] flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">{l.id}<RiskBadge level={l.risk_level} /></div>
                    <div className="text-xs text-gray-600">{l.location} - {l.reasons.join(', ')}</div>
                  </div>
                  <div className="text-right text-sm font-semibold tabular-nums">{pct(l.failure_probability)}</div>
                  <button className="btn" onClick={() => done(l.id)} disabled={busyId === l.id}><Wrench size={15} /> {busyId === l.id ? 'Saving...' : 'Mark serviced'}</button>
                </li>
              ))}
              {res.data?.length === 0 && <li className="p-8 text-center text-sm text-gray-600">Nothing to service. Every streetlight is rated healthy.</li>}
            </ul>
          </section>
        </ApiState>
        <PhotoCheck />
      </div>
    </div>
  )
}
