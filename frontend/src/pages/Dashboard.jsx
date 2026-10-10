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
        <div className="relative h-[calc(100vh-49px)] lg:h-screen">
          <div className="absolute inset-0 isolate"><MapView lights={lights} selectedId={selId} onSelect={onSelect} /></div>

          <div className="pointer-events-none absolute inset-x-4 top-4 z-[500] grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard icon={Lightbulb} label="Total streetlights" value={stats.total} />
            <StatCard icon={CheckCircle2} label="Working" value={stats.working} tone="#166534" />
            <StatCard icon={AlertTriangle} label="At risk" value={stats.at_risk} tone="#A16207" />
            <StatCard icon={ZapOff} label="Failed" value={stats.failed} tone="#991B1B" />
            <StatCard icon={Siren} label="High priority" value={stats.high_priority} tone="#0047AB" />
          </div>

          <aside className="glass absolute bottom-4 right-4 top-[150px] z-[500] hidden w-80 flex-col rounded-2xl p-4 xl:top-[100px] lg:flex">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">Fix first</h2>
              <span className="text-xs text-gray-600">Network efficiency {stats.efficiency}%</span>
            </div>
            <ul className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
              {queue.slice(0, 8).map((l) => (
                <li key={l.id}>
                  <button onClick={() => setSelId(l.id)} className="w-full rounded-xl bg-white/60 p-2.5 text-left transition hover:bg-white">
                    <div className="flex items-center justify-between text-sm font-medium">{l.id}<RiskBadge level={l.risk_level} /></div>
                    <div className="mt-0.5 flex justify-between text-xs text-gray-600"><span>{l.location.split(',')[0]}</span><span>{pct(l.failure_probability)}</span></div>
                  </button>
                </li>
              ))}
            </ul>
            <Link to="/maintenance" className="btn mt-3">Open maintenance queue</Link>
          </aside>

          {sel && <LightCard light={sel} onClose={() => setSelId(null)} onChanged={all.reload} className="absolute bottom-4 left-4 z-[600] w-[min(22rem,calc(100%-2rem))]" />}
        </div>
      )}
    </ApiState>
  )
}
