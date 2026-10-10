import { useCallback, useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Cpu, RefreshCw, Radio, Zap, Play, Square, Settings } from 'lucide-react'
import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'

function Metric({ icon: Icon, label, value, tone = 'text-ink' }) {
  return <div className="glass rounded-2xl p-4"><div className="flex items-center justify-between text-sm text-gray-600"><span>{label}</span><Icon size={18} /></div><div className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</div></div>
}

export default function IoTMonitor() {
  const [simulating, setSimulating] = useState(false)
  const [scenario, setScenario] = useState('normal')
  const [targetId, setTargetId] = useState('')
  const [autoTick, setAutoTick] = useState(false)
  
  const load = useCallback(() => api.iotReadings(), [])
  const res = useApi(load, [])
  const snapshot = res.data
  const readings = snapshot?.readings || []
  const faults = readings.filter((r) => r.sensor_status === 'FAULT').length

  const alertsLoad = useCallback(() => api.iotAlerts(), [])
  const alertsRes = useApi(alertsLoad, [])
  const alerts = alertsRes.data || []

  useEffect(() => {
    let interval
    if (autoTick) {
      interval = setInterval(() => {
        advanceSimulation()
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [autoTick])

  async function advanceSimulation() {
    setSimulating(true)
    try {
      await api.simulateIotTick()
      await res.reload()
      await alertsRes.reload()
    } catch (e) {
      console.error('Unable to advance IoT simulation:', e)
      setAutoTick(false)
    } finally {
      setSimulating(false)
    }
  }

  async function applyConfig() {
    try {
      await api.setIotConfig({ scenario, target: targetId || null })
      advanceSimulation()
    } catch (e) {
      console.error(e)
    }
  }

  async function toggleAuto() {
    const nextState = !autoTick
    try {
      await api.setIotState({ active: nextState })
      setAutoTick(nextState)
    } catch (e) {
      console.error(e)
    }
  }

  return <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-semibold tracking-tight">IoT Sensor Monitor</h1><p className="mt-1 text-sm text-gray-600">Simulated telemetry for streetlight power and lamp-output monitoring.</p></div>
      <div className="flex gap-2">
        <button className={`btn ${autoTick ? 'bg-red-50 text-red-700 border-red-200' : ''}`} onClick={toggleAuto}>
          {autoTick ? <Square size={16} /> : <Play size={16} />}
          {autoTick ? 'Stop Simulation' : 'Start Simulation'}
        </button>
        <button className="btn" onClick={advanceSimulation} disabled={simulating || res.loading}><RefreshCw size={16} className={simulating ? 'animate-spin' : ''} />Tick</button>
      </div>
    </div>

    <div className="glass rounded-2xl p-4 space-y-4">
      <div className="flex items-center gap-2 font-semibold border-b border-white/70 pb-3"><Settings size={18} /> Simulation Control Panel</div>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scenario</label>
          <select value={scenario} onChange={e => setScenario(e.target.value)} className="field block w-full rounded-md sm:text-sm">
            <option value="normal">Normal Operation</option>
            <option value="lamp_failure">Lamp Failure</option>
            <option value="low_brightness">Low Brightness</option>
            <option value="abnormal_voltage">Abnormal Voltage</option>
            <option value="abnormal_current">Abnormal Current</option>
            <option value="overheating">Overheating</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target ID (optional)</label>
          <input type="text" placeholder="e.g. SL-001" value={targetId} onChange={e => setTargetId(e.target.value)} className="field block w-full rounded-md sm:text-sm" />
        </div>
        <button className="btn" onClick={applyConfig}>Apply Config</button>
      </div>
    </div>

    {alerts.length > 0 && (
      <div className="rounded-xl border border-red-300 bg-red-50 overflow-hidden">
        <div className="p-3 font-semibold text-red-900 border-b border-red-200 flex gap-2 items-center"><AlertTriangle size={18}/> Active Alerts</div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-red-900">
            <thead className="bg-red-100 text-xs"><tr><th className="px-4 py-2">Light ID</th><th className="px-4 py-2">Fault</th><th className="px-4 py-2">Severity</th><th className="px-4 py-2">Reading</th><th className="px-4 py-2">Time</th></tr></thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className="border-t border-red-200">
                  <td className="px-4 py-2 font-medium">{a.streetlight_id}</td>
                  <td className="px-4 py-2">{a.fault_type}</td>
                  <td className="px-4 py-2 font-semibold">{a.severity}</td>
                  <td className="px-4 py-2">{a.reading} (Threshold: {a.threshold})</td>
                  <td className="px-4 py-2 text-xs opacity-75">{new Date(a.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

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
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white/70 text-xs text-gray-600"><tr><th className="px-4 py-3">Device / light</th><th className="px-3 py-3">Area</th><th className="px-3 py-3 text-right">Voltage</th><th className="px-3 py-3 text-right">Current</th><th className="px-3 py-3 text-right">Lamp lux</th><th className="px-3 py-3">Temp</th><th className="px-3 py-3">Sensor state</th><th className="px-4 py-3">Alert</th></tr></thead>
            <tbody>{readings.map((r) => <tr key={r.device_id} className="border-t border-white/70"><td className="px-4 py-3"><div className="font-medium">{r.device_id}</div><div className="text-xs text-gray-500">{r.streetlight_id}</div></td><td className="px-3 py-3">{r.location.split(',')[0]}</td><td className="px-3 py-3 text-right tabular-nums">{r.voltage_v.toFixed(1)} V</td><td className="px-3 py-3 text-right tabular-nums">{r.current_a.toFixed(2)} A</td><td className="px-3 py-3 text-right tabular-nums">{r.lamp_lux.toFixed(1)}</td><td className="px-3 py-3 text-right tabular-nums">{r.temperature_c.toFixed(1)}°C</td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${r.sensor_status === 'FAULT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{r.sensor_status === 'FAULT' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}{r.sensor_status}</span></td><td className="px-4 py-3 text-xs text-gray-600">{r.alert || 'No fault detected'}</td></tr>)}</tbody>
          </table></div>
          {!readings.length && <div className="p-8 text-center text-sm text-gray-500">No simulated devices available.</div>}
        </section>
      </>}
    </ApiState>
  </div>
}
