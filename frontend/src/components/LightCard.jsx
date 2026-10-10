import { useState } from 'react'
import { Wrench, X } from 'lucide-react'
import RiskBadge from './RiskBadge'
import { api } from '../services/api'
import { pct, RISK_COLOR } from '../utils/risk'

const READ = [
  ['Age', (l) => `${l.age_years} yrs`], ['Past failures', (l) => l.previous_failures],
  ['Voltage', (l) => `${l.voltage} V`], ['Nightly run', (l) => `${l.operating_hours} h`],
  ['Temperature', (l) => `${l.temperature} °C`], ['Rainfall', (l) => `${l.rainfall} mm`],
  ['Services', (l) => l.maintenance_count], ['Since service', (l) => `${l.days_since_maintenance} d`],
]

export default function LightCard({ light, onClose, onChanged, className = '' }) {
  const [busy, setBusy] = useState(false)
  if (!light) return null
  const done = async () => {
    setBusy(true)
    try { await api.complete(light.id); onChanged?.() } finally { setBusy(false) }
  }
  return (
    <div className={`bg-white border border-gray-200 shadow-md rounded p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-cobalt">{light.id}</div>
          <div className="text-xs text-gray-500 mt-0.5">{light.location}</div>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={light.risk_level} />
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close details"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Failure probability (next 30 days)</span>
          <strong className="text-ink">{pct(light.failure_probability)}</strong>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full"
            style={{ width: pct(light.failure_probability), background: RISK_COLOR[light.risk_level] }}
          />
        </div>
      </div>
      <ul className="mt-3 list-disc pl-4 text-xs text-gray-600 space-y-0.5">
        {light.reasons.map((r) => <li key={r}>{r}</li>)}
      </ul>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs border-t border-gray-100 pt-3">
        {READ.map(([k, f]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-gray-500">{k}</dt>
            <dd className="font-medium tabular-nums text-ink">{f(light)}</dd>
          </div>
        ))}
      </dl>
      {light.risk_level !== 'LOW' && (
        <button className="btn mt-4 w-full" onClick={done} disabled={busy}>
          <Wrench size={15} /> {busy ? 'Saving...' : 'Mark as serviced'}
        </button>
      )}
    </div>
  )
}
