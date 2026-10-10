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
    <section className="h-fit rounded border border-gray-200 bg-white shadow-sm p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2.5 mb-3">
        <Camera size={15} /> Photo Inspection
      </h2>
      <p className="mb-3 text-xs text-gray-500">Upload a night-time photo of a pole. The system checks whether the lamp is lit.</p>
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        className="field text-xs"
        aria-label="Upload streetlight photo"
      />
      {busy && <p className="mt-3 text-xs text-gray-500">Analysing image…</p>}
      {err && <p className="mt-3 text-xs text-red-700">{err}</p>}
      {res && (res.error || res.message
        ? <p className="mt-3 text-xs text-red-700">{res.error || res.message}</p>
        : (
          <div className="mt-3 rounded border border-gray-200 bg-[#F8F9FB] p-3 text-sm" aria-live="polite">
            <div className="font-semibold" style={{ color: res.lamp_state === 'lit' ? '#2e7d32' : '#b71c1c' }}>
              Lamp appears {res.lamp_state}
            </div>
            <div className="mt-1 text-xs text-gray-600">{res.bright_regions} bright region(s) — confidence {pct(res.confidence)}</div>
            <div className="mt-1 text-xs text-gray-400">{res.note}</div>
          </div>
        )
      )}
    </section>
  )
}

export default function Maintenance() {
  const res = useApi(api.maintenance)
  const [busyId, setBusyId] = useState(null)
  const done = async (id) => {
    setBusyId(id)
    try { await api.complete(id); res.reload() } finally { setBusyId(null) }
  }
  const failed = res.data?.filter((l) => l.risk_level === 'FAILED').length ?? 0

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="pg-header">
        <h1 className="text-xl font-semibold text-cobalt">Maintenance Queue</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Outages first, then streetlights most likely to fail next. Marking a job as serviced resets its service clock and re-scores it.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <ApiState {...res}>
          <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-[#F8F9FB] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Work Orders</h2>
              <span className="text-xs text-gray-500">{res.data?.length} total, {failed} outage{failed !== 1 ? 's' : ''}</span>
            </div>
            <ul className="max-h-[75vh] divide-y divide-gray-100 overflow-y-auto">
              {res.data?.map((l, i) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-[#F8F9FB] transition-colors">
                  <span className="w-7 shrink-0 text-sm tabular-nums text-gray-400 font-medium">{i + 1}</span>
                  <div className="min-w-[10rem] flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-cobalt">
                      {l.id}
                      <RiskBadge level={l.risk_level} />
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">{l.location} — {l.reasons.join(', ')}</div>
                  </div>
                  <div className="text-right text-sm font-semibold tabular-nums text-ink">{pct(l.failure_probability)}</div>
                  <button
                    className="btn text-xs"
                    onClick={() => done(l.id)}
                    disabled={busyId === l.id}
                  >
                    <Wrench size={14} />
                    {busyId === l.id ? 'Saving…' : 'Mark serviced'}
                  </button>
                </li>
              ))}
              {res.data?.length === 0 && (
                <li className="p-8 text-center text-sm text-gray-500">
                  <div className="font-medium text-gray-700 mb-1">Queue is empty</div>
                  Every streetlight is currently rated healthy.
                </li>
              )}
            </ul>
          </section>
        </ApiState>
        <PhotoCheck />
      </div>
    </div>
  )
}
