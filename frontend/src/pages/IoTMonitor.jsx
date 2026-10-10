import { useCallback, useState } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Cpu, RefreshCw, Radio, Zap } from 'lucide-react'
import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'

function Metric({ icon: Icon, label, value, tone = 'text-ink' }) {
  return <div className="glass rounded-2xl p-4"><div className="flex items-center justify-between text-sm text-gray-600"><span>{label}</span><Icon size={18} /></div><div className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</div></div>
}

export default function IoTMonitor() {
  const [simulating, setSimulating] = useState(false)
  const load = useCallback(() => api.iotReadings(), [])
  const res = useApi(load, [])
  const snapshot = res.data
  const readings = snapshot?.readings || []
  const faults = readings.filter((r) => r.sensor_status === 'FAULT').length

  async function advanceSimulation() {
    setSimulating(true)
    try {
      await api.simulateIotTick()
      await res.reload()
    } catch (e) {
      // useApi handles fetch errors on reload; preserve the existing view on a tick error.
      console.error('Unable to advance IoT simulation:', e)
    } finally {
      setSimulating(false)
    }
  }

  return <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">IoT Sensor Monitor</h1><p className="mt-1 text-sm text-gray-600">Simulated telemetry for streetlight power and lamp-output monitoring.</p></div>
      <button className="btn" onClick={advanceSimulation} disabled={simulating || res.loading}><RefreshCw size={16} className={simulating ? 'animate-spin' : ''} />{simulating ? 'Generating…' : 'Generate next reading'}</button>
    </div>

    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle size={19} className="mt-0.5 shrink-0" /><div><b>Simulation mode:</b> these are generated demo readings, not measurements from physical hardware. Faults are inferred from simulated current and lamp-light output.</div></div>

    <ApiState {...res}>
      {snapshot && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Radio} label="Registered devices" value={readings.length} />
          <Metric icon={CheckCircle2} label="Normal readings" value={readings.length - faults} tone="text-green-700" />
          <Metric icon={AlertTriangle} label="Detected sensor faults" value={faults} tone={faults ? 'text-red-700' : 'text-green-700'} />
          <Metric icon={Activity} label="Simulation cycle" value={`#${snapshot.tick}`} />
        </div>

        <section className="glass overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/70 p-4"><div><h2 className="font-semibold">Latest sensor readings</h2><p className="mt-1 text-xs text-gray-600">Updated: {new Date(snapshot.generated_at).toLocaleString()}</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">SIMULATED DATA</span></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white/70 text-xs text-gray-600"><tr><th className="px-4 py-3">Device / light</th><th className="px-3 py-3">Area</th><th className="px-3 py-3 text-right">Voltage</th><th className="px-3 py-3 text-right">Current</th><th className="px-3 py-3 text-right">Lamp lux</th><th className="px-3 py-3">Sensor state</th><th className="px-4 py-3">Alert</th></tr></thead>
            <tbody>{readings.map((r) => <tr key={r.device_id} className="border-t border-white/70"><td className="px-4 py-3"><div className="font-medium">{r.device_id}</div><div className="text-xs text-gray-500">{r.streetlight_id}</div></td><td className="px-3 py-3">{r.location.split(',')[0]}</td><td className="px-3 py-3 text-right tabular-nums">{r.voltage_v.toFixed(1)} V</td><td className="px-3 py-3 text-right tabular-nums">{r.current_a.toFixed(2)} A</td><td className="px-3 py-3 text-right tabular-nums">{r.lamp_lux.toFixed(1)}</td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${r.sensor_status === 'FAULT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{r.sensor_status === 'FAULT' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}{r.sensor_status}</span></td><td className="px-4 py-3 text-xs text-gray-600">{r.alert || 'No fault detected'}</td></tr>)}</tbody>
          </table></div>
          {!readings.length && <div className="p-8 text-center text-sm text-gray-500">No simulated devices available.</div>}
        </section>
        <div className="grid gap-3 md:grid-cols-2"><div className="glass rounded-2xl p-4"><div className="flex items-center gap-2 font-semibold"><Cpu size={18} />Telemetry pipeline</div><p className="mt-2 text-sm leading-6 text-gray-600">Simulator → FastAPI ingestion/readings endpoints → current/voltage/light-output fault rules → IoT dashboard. The existing predictive-risk model and maintenance workflows remain unchanged.</p></div><div className="glass rounded-2xl p-4"><div className="flex items-center gap-2 font-semibold"><Zap size={18} />Fault rule</div><p className="mt-2 text-sm leading-6 text-gray-600">A fault is flagged when simulated current is below 0.05 A or lamp output is below 10 lux while the lamp is commanded on. This is a demonstration rule, not a validated field threshold.</p></div></div>
      </>}
    </ApiState>
  </div>
}
