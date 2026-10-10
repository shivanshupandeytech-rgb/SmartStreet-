import { useCallback, useState, useEffect } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Radio, RefreshCw, Play, Square, Settings, Zap } from 'lucide-react'
import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'

function Metric({ icon: Icon, label, value, tone = 'text-cobalt' }) {
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span className="font-medium">{label}</span>
        <Icon size={16} className={tone} />
      </div>
      <div className={`text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  )
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
      interval = setInterval(() => { advanceSimulation() }, 3000)
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
    } catch (e) { console.error(e) }
  }

  async function toggleAuto() {
    const nextState = !autoTick
    try {
      await api.setIotState({ active: nextState })
      setAutoTick(nextState)
    } catch (e) { console.error(e) }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      {/* Page header */}
      <div className="pg-header flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-cobalt">IoT Sensor Monitor</h1>
          <p className="mt-0.5 text-sm text-gray-500">Simulated telemetry for streetlight power and lamp-output monitoring.</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn ${autoTick ? '!bg-red-700 hover:!bg-red-800' : ''}`}
            onClick={toggleAuto}
          >
            {autoTick ? <Square size={15} /> : <Play size={15} />}
            {autoTick ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          <button
            className="btn-quiet"
            onClick={advanceSimulation}
            disabled={simulating || res.loading}
          >
            <RefreshCw size={15} className={simulating ? 'animate-spin' : ''} />
            Tick
          </button>
        </div>
      </div>

      {/* Control panel */}
      <section className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-200 pb-3 mb-4">
          <Settings size={16} /> Simulation Control Panel
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scenario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="field w-auto"
            >
              <option value="normal">Normal Operation</option>
              <option value="lamp_failure">Lamp Failure</option>
              <option value="low_brightness">Low Brightness</option>
              <option value="abnormal_voltage">Abnormal Voltage</option>
              <option value="abnormal_current">Abnormal Current</option>
              <option value="overheating">Overheating</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Target ID (optional)</label>
            <input
              type="text"
              placeholder="e.g. SL-001"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="field w-44"
            />
          </div>
          <button className="btn" onClick={applyConfig}>Apply Config</button>
        </div>
      </section>

      {/* Active alerts */}
      {alerts.length > 0 && (
        <section className="rounded border border-red-300 bg-red-50 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-red-200 bg-red-100 px-4 py-2.5">
            <AlertTriangle size={16} className="text-red-700 shrink-0" />
            <span className="text-sm font-semibold text-red-900">Active Alerts ({alerts.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-red-900">
              <thead className="text-xs bg-red-50 border-b border-red-200">
                <tr>
                  <th className="px-4 py-2 font-semibold">Light ID</th>
                  <th className="px-4 py-2 font-semibold">Fault</th>
                  <th className="px-4 py-2 font-semibold">Severity</th>
                  <th className="px-4 py-2 font-semibold">Reading</th>
                  <th className="px-4 py-2 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2 font-medium">{a.streetlight_id}</td>
                    <td className="px-4 py-2">{a.fault_type}</td>
                    <td className="px-4 py-2 font-semibold">{a.severity}</td>
                    <td className="px-4 py-2">{a.reading} <span className="text-xs opacity-60">(Threshold: {a.threshold})</span></td>
                    <td className="px-4 py-2 text-xs opacity-60">{new Date(a.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ApiState {...res}>
        {snapshot && (
          <>
            {/* Metrics row */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={Radio} label="Registered devices" value={readings.length} />
              <Metric icon={CheckCircle2} label="Normal readings" value={readings.length - faults} tone="text-green-700" />
              <Metric icon={AlertTriangle} label="Sensor faults" value={faults} tone={faults ? 'text-red-700' : 'text-green-700'} />
              <Metric icon={Activity} label="Simulation cycle" value={`#${snapshot.tick}`} />
            </div>

            {/* Readings table */}
            <section className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-[#F8F9FB] px-4 py-2.5">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">Latest Sensor Readings</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Updated: {new Date(snapshot.generated_at).toLocaleString()}</p>
                </div>
                <span className="rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">SIMULATED DATA</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-500 bg-[#F8F9FB] border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Device / Light</th>
                      <th className="px-3 py-2.5 font-semibold">Area</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Voltage</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Current</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Lamp lux</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Temp</th>
                      <th className="px-3 py-2.5 font-semibold">Sensor state</th>
                      <th className="px-4 py-2.5 font-semibold">Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {readings.map((r) => (
                      <tr key={r.device_id} className="hover:bg-[#F8F9FB] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-cobalt">{r.device_id}</div>
                          <div className="text-xs text-gray-400">{r.streetlight_id}</div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">{r.location.split(',')[0]}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.voltage_v.toFixed(1)} V</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.current_a.toFixed(2)} A</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.lamp_lux.toFixed(1)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{r.temperature_c.toFixed(1)}°C</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
                            r.sensor_status === 'FAULT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {r.sensor_status === 'FAULT'
                              ? <AlertTriangle size={11} />
                              : <CheckCircle2 size={11} />}
                            {r.sensor_status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{r.alert || 'No fault detected'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!readings.length && (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No simulated devices available. Click <strong>Tick</strong> or <strong>Start Simulation</strong> to generate readings.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </ApiState>
    </div>
  )
}
