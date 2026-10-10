import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import ApiState from '../components/State'
import RiskBadge from '../components/RiskBadge'
import LightCard from '../components/LightCard'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { pct } from '../utils/risk'

const FILTERS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'FAILED']

export default function Streetlights() {
  const res = useApi(api.lights)
  const [q, setQ] = useState('')
  const [f, setF] = useState('ALL')
  const [sort, setSort] = useState('priority_score')
  const [selId, setSelId] = useState(null)

  const rows = useMemo(() => {
    let r = res.data || []
    if (f !== 'ALL') r = r.filter((x) => x.risk_level === f)
    if (q) r = r.filter((x) => (x.id + x.location).toLowerCase().includes(q.toLowerCase()))
    return [...r].sort((a, b) => (sort === 'id' ? a.id.localeCompare(b.id) : b[sort] - a[sort]))
  }, [res.data, q, f, sort])
  const sel = res.data?.find((l) => l.id === selId)

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Streetlights</h1>
      <p className="mb-4 text-sm text-gray-600">Every pole with its current condition and predicted failure risk.</p>
      <ApiState {...res}>
        <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <section className="glass overflow-hidden rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/70 p-3">
              <label className="relative min-w-[12rem] flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                <input className="field pl-9" placeholder="Search by ID or area" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
              <select className="field w-auto" value={f} onChange={(e) => setF(e.target.value)} aria-label="Filter by risk">
                {FILTERS.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                <option value="priority_score">Sort: priority</option>
                <option value="failure_probability">Sort: failure risk</option>
                <option value="age_years">Sort: age</option>
                <option value="days_since_maintenance">Sort: days since service</option>
                <option value="id">Sort: ID</option>
              </select>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/80 text-xs text-gray-600 backdrop-blur">
                  <tr><th className="px-4 py-2">ID</th><th>Area</th><th>Status</th><th className="text-right">Risk</th><th className="text-right">Age</th><th className="px-4 text-right">Since service</th></tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} onClick={() => setSelId(l.id)} className={`cursor-pointer border-t border-white/60 hover:bg-white/60 ${l.id === selId ? 'bg-white/70' : ''}`}>
                      <td className="px-4 py-2 font-medium">{l.id}</td>
                      <td>{l.location.split(',')[0]}</td>
                      <td><RiskBadge level={l.risk_level} /></td>
                      <td className="text-right tabular-nums">{pct(l.failure_probability)}</td>
                      <td className="text-right tabular-nums">{l.age_years} y</td>
                      <td className="px-4 text-right tabular-nums">{l.days_since_maintenance} d</td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-gray-600">No streetlights match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/70 px-4 py-2 text-xs text-gray-600">{rows.length} of {res.data?.length} streetlights</div>
          </section>
          <div>{sel ? <LightCard light={sel} onClose={() => setSelId(null)} onChanged={res.reload} /> : <div className="glass rounded-2xl p-6 text-sm text-gray-600">Select a streetlight to see its readings and why it is rated this way.</div>}</div>
        </div>
      </ApiState>
    </div>
  )
}
