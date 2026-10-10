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
      {/* Page header */}
      <div className="pg-header">
        <h1 className="text-xl font-semibold text-cobalt">Streetlight Registry</h1>
        <p className="mt-0.5 text-sm text-gray-500">Complete inventory of all poles with current condition and predicted failure risk.</p>
      </div>

      <ApiState {...res}>
        <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-[#F8F9FB] px-3 py-2.5">
              <label className="relative flex-1 min-w-[10rem]">
                <Search size={15} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  className="field !pl-8"
                  placeholder="Search by ID or area"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  id="streetlight-search"
                />
              </label>
              <select className="field w-auto" value={f} onChange={(e) => setF(e.target.value)} aria-label="Filter by risk">
                {FILTERS.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                <option value="priority_score">Sort: Priority</option>
                <option value="failure_probability">Sort: Failure risk</option>
                <option value="age_years">Sort: Age</option>
                <option value="days_since_maintenance">Sort: Days since service</option>
                <option value="id">Sort: ID</option>
              </select>
            </div>

            {/* Table */}
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[#F8F9FB] text-xs text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">ID</th>
                    <th className="py-2.5 font-semibold">Area</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 pr-4 text-right font-semibold">Risk</th>
                    <th className="py-2.5 text-right font-semibold">Age</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Since service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => setSelId(l.id)}
                      className={`cursor-pointer hover:bg-[#F2F4F7] transition-colors ${l.id === selId ? 'bg-[#EBF0F7]' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-cobalt">{l.id}</td>
                      <td className="py-2.5 text-gray-700">{l.location.split(',')[0]}</td>
                      <td className="py-2.5"><RiskBadge level={l.risk_level} /></td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-gray-700">{pct(l.failure_probability)}</td>
                      <td className="py-2.5 text-right tabular-nums text-gray-700">{l.age_years} y</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{l.days_since_maintenance} d</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">No streetlights match these filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 bg-[#F8F9FB] px-4 py-2 text-xs text-gray-500">
              Showing {rows.length} of {res.data?.length} streetlights
            </div>
          </section>

          {/* Detail panel */}
          <div>
            {sel
              ? <LightCard light={sel} onClose={() => setSelId(null)} onChanged={res.reload} />
              : (
                <div className="rounded border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
                  <p className="font-medium text-gray-700 mb-1">No streetlight selected</p>
                  <p>Click any row in the table to view its readings and risk assessment.</p>
                </div>
              )
            }
          </div>
        </div>
      </ApiState>
    </div>
  )
}
