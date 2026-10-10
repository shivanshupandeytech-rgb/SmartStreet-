import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lightbulb, CheckCircle2, AlertTriangle, ZapOff, Siren } from 'lucide-react'
import MapView from '../components/MapView'
import StatCard from '../components/StatCard'
import LightCard from '../components/LightCard'
import RiskBadge from '../components/RiskBadge'
import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { pct } from '../utils/risk'

export default function Dashboard() {
  const all = useApi(() => Promise.all([api.stats(), api.lights(), api.maintenance()]))
  const [selId, setSelId] = useState(null)
  const onSelect = useCallback((l) => setSelId(l.id), [])
  const [stats, lights, queue] = all.data || []
  const sel = lights?.find((l) => l.id === selId)

  return (
    <ApiState {...all} data={all.data}>
      {all.data && (
        <div className="relative h-[calc(100vh-56px)]">
          {/* Map fills background */}
          <div className="absolute inset-0 isolate"><MapView lights={lights} selectedId={selId} onSelect={onSelect} /></div>

          {/* KPI strip — top left, pointer-events on cards only */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard icon={Lightbulb} label="Total streetlights" value={stats.total} />
            <StatCard icon={CheckCircle2} label="Working" value={stats.working} tone="#2e7d32" />
            <StatCard icon={AlertTriangle} label="At risk" value={stats.at_risk} tone="#b45309" />
            <StatCard icon={ZapOff} label="Failed" value={stats.failed} tone="#b71c1c" />
            <StatCard icon={Siren} label="High priority" value={stats.high_priority} tone="#17365D" />
          </div>

          {/* Priority queue panel — right side */}
          <aside className="absolute bottom-3 right-3 top-[150px] z-[500] hidden w-72 flex-col rounded bg-white border border-gray-200 shadow-md xl:top-[120px] lg:flex overflow-hidden">
            <div className="flex items-baseline justify-between border-b border-gray-200 bg-[#F8F9FB] px-4 py-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600">Priority Queue</h2>
              <span className="text-xs text-gray-500">Efficiency {stats.efficiency}%</span>
            </div>
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {queue.slice(0, 8).map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => setSelId(l.id)}
                    className="w-full px-4 py-2.5 text-left transition hover:bg-[#F2F4F7]"
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-ink">
                      {l.id}
                      <RiskBadge level={l.risk_level} />
                    </div>
                    <div className="mt-0.5 flex justify-between text-xs text-gray-500">
                      <span>{l.location.split(',')[0]}</span>
                      <span>{pct(l.failure_probability)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 p-3">
              <Link to="/maintenance" className="btn block w-full text-center text-sm">Open Maintenance Queue</Link>
            </div>
          </aside>

          {/* Light detail card */}
          {sel && (
            <LightCard
              light={sel}
              onClose={() => setSelId(null)}
              onChanged={all.reload}
              className="absolute bottom-3 left-3 z-[600] w-[min(22rem,calc(100%-1.5rem))]"
            />
          )}
        </div>
      )}
    </ApiState>
  )
}
