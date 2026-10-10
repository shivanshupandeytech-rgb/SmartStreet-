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
      <div className="relative h-[calc(100vh-56px)]">
        <div className="absolute inset-0 isolate"><MapView lights={lights} selectedId={selId} onSelect={onSelect} /></div>

        {/* Layer filter panel */}
        <div className="absolute left-3 top-3 z-[500] rounded border border-gray-200 bg-white shadow-md p-3 min-w-[140px]">
          <div className="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Show on map</div>
          {Object.keys(show).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700 hover:text-cobalt">
              <input
                type="checkbox"
                checked={show[k]}
                onChange={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
                className="accent-cobalt"
              />
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: RISK_COLOR[k] }} />
              {RISK_LABEL[k]}
            </label>
          ))}
          <div className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">{lights.length} pole{lights.length !== 1 ? 's' : ''} shown</div>
        </div>

        {/* Light detail card */}
        {sel && (
          <LightCard
            light={sel}
            onClose={() => setSelId(null)}
            onChanged={res.reload}
            className="absolute bottom-3 right-3 z-[600] w-[min(22rem,calc(100%-1.5rem))]"
          />
        )}
      </div>
    </ApiState>
  )
}
