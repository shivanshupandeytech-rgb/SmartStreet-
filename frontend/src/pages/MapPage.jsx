import { useCallback, useMemo, useState } from 'react'
import MapView from '../components/MapView'
import LightCard from '../components/LightCard'
import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'
import { RISK_COLOR, RISK_LABEL } from '../utils/risk'

export default function MapPage() {
  const res = useApi(api.lights)
  const [show, setShow] = useState({ LOW: true, MEDIUM: true, HIGH: true, FAILED: true })
  const [selId, setSelId] = useState(null)
  const onSelect = useCallback((l) => setSelId(l.id), [])
  const lights = useMemo(() => (res.data || []).filter((l) => show[l.risk_level]), [res.data, show])
  const sel = res.data?.find((l) => l.id === selId)

  return (
    <ApiState {...res}>
      <div className="relative h-[calc(100vh-49px)] lg:h-screen">
        <div className="absolute inset-0 isolate"><MapView lights={lights} selectedId={selId} onSelect={onSelect} /></div>
        <div className="glass absolute left-4 top-4 z-[500] rounded-2xl p-3">
          <div className="mb-2 text-xs font-semibold">Show on map</div>
          {Object.keys(show).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
              <input type="checkbox" checked={show[k]} onChange={() => setShow((s) => ({ ...s, [k]: !s[k] }))} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLOR[k] }} /> {RISK_LABEL[k]}
            </label>
          ))}
          <div className="mt-2 text-xs text-gray-600">{lights.length} shown</div>
        </div>
        {sel && <LightCard light={sel} onClose={() => setSelId(null)} onChanged={res.reload} className="absolute bottom-4 right-4 z-[600] w-[min(22rem,calc(100%-2rem))]" />}
      </div>
    </ApiState>
  )
}
