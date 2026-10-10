const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function req(path, opts) {
  let res
  try {
    res = await fetch(`${BASE}/api${path}`, opts)
  } catch {
    throw new Error(`Cannot reach the API at ${BASE}. Start the backend (uvicorn app.main:app --reload --port 8000).`)
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export const api = {
  stats: () => req('/stats'),
  lights: () => req('/streetlights'),
  predictions: (limit = 25) => req(`/predictions?limit=${limit}`),
  whatIf: (body) => req('/predictions/what-if', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  maintenance: () => req('/maintenance'),
  complete: (id) => req(`/maintenance/${id}/complete`, { method: 'POST' }),
  analytics: () => req('/analytics'),
  analyzeImage: (file) => { const f = new FormData(); f.append('file', file); return req('/vision/analyze', { method: 'POST', body: f }) },
  iotReadings: () => req('/iot/readings'),
  iotSummary: () => req('/iot/summary'),
  simulateIotTick: () => req('/iot/simulate/tick', { method: 'POST' }),
  setIotConfig: (body) => req('/iot/simulate/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  setIotState: (body) => req('/iot/simulate/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  iotAlerts: () => req('/iot/alerts'),
}
