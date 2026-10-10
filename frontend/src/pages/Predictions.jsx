import { useState } from 'react'
import ApiState from '../components/State'
import RiskBadge from '../components/RiskBadge'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { pct, RISK_COLOR } from '../utils/risk'

const FIELDS = [
  ['age_years', 'Age (years)', 0, 15, 0.5], ['previous_failures', 'Past failures', 0, 8, 1],
  ['voltage', 'Voltage (V)', 190, 260, 1], ['operating_hours', 'Nightly run (h)', 6, 14, 0.5],
  ['temperature', 'Temperature (C)', 10, 48, 1], ['rainfall', 'Rainfall (mm)', 0, 40, 1],
  ['maintenance_count', 'Services done', 0, 10, 1], ['days_since_maintenance', 'Days since service', 0, 450, 5],
]
const INIT = { age_years: 4, previous_failures: 1, voltage: 230, operating_hours: 10.5, temperature: 32, rainfall: 4, maintenance_count: 2, days_since_maintenance: 120 }

export default function Predictions() {
  const res = useApi(() => api.predictions(25))
  const [form, setForm] = useState(INIT)
  const [out, setOut] = useState(null)
  const [busy, setBusy] = useState(false)
  const run = async () => { setBusy(true); try { setOut(await api.whatIf(form)) } finally { setBusy(false) } }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Predictions</h1>
      <p className="mb-4 text-sm text-gray-600">Working streetlights ranked by the model's estimated chance of failing in the next 30 days.</p>
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <ApiState {...res}>
          <section className="glass overflow-hidden rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/80 text-xs text-gray-600"><tr><th className="px-4 py-2">Streetlight</th><th>Likely drivers</th><th className="px-4 text-right">Failure chance</th></tr></thead>
              <tbody>
                {res.data?.map((l) => (
                  <tr key={l.id} className="border-t border-white/60 align-top">
                    <td className="px-4 py-2.5"><div className="font-medium">{l.id}</div><div className="text-xs text-gray-600">{l.location.split(',')[0]}</div></td>
                    <td className="py-2.5 pr-3 text-xs text-gray-700">{l.reasons.join(', ')}</td>
                    <td className="px-4 py-2.5 text-right"><div className="font-semibold tabular-nums">{pct(l.failure_probability)}</div><RiskBadge level={l.risk_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </ApiState>

        <section className="glass h-fit rounded-2xl p-4">
          <h2 className="text-sm font-semibold">Try a scenario</h2>
          <p className="mb-3 text-xs text-gray-600">Change the readings and see how the model rates a streetlight.</p>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(([k, label, min, max, step]) => (
              <label key={k} className="text-xs text-gray-700">{label}
                <input type="number" className="field mt-1" min={min} max={max} step={step} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
              </label>
            ))}
          </div>
          <button className="btn mt-4 w-full" onClick={run} disabled={busy}>{busy ? 'Calculating...' : 'Estimate risk'}</button>
          {out && (
            <div className="mt-4 rounded-xl bg-white/70 p-3" aria-live="polite">
              <div className="flex items-center justify-between"><span className="text-2xl font-semibold" style={{ color: RISK_COLOR[out.risk_level] }}>{pct(out.failure_probability)}</span><RiskBadge level={out.risk_level} /></div>
              <p className="mt-2 text-xs text-gray-700">{out.reasons.join(', ')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
