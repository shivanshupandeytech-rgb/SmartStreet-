import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'

const STEPS = [
  'Streetlight readings',
  'Feature processing',
  'Random Forest model',
  'Risk rating',
  'Maintenance priority',
  'Dashboard and map',
]

export default function About() {
  const res = useApi(api.stats)

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="pg-header">
        <h1 className="text-xl font-semibold text-cobalt">About SmartStreet</h1>
        <p className="mt-0.5 text-sm text-gray-500">AI-Powered Streetlight Failure Detection and Predictive Maintenance System</p>
      </div>

      <section className="rounded border border-gray-200 bg-white shadow-sm p-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          SmartStreet helps a municipal team find streetlights that are about to fail — not only the ones that already have.
          It scores every pole using machine learning, rates it <strong>Healthy</strong>, <strong>Watch</strong> or <strong>High risk</strong>,
          and puts the most urgent jobs at the top of the maintenance queue.
        </p>
      </section>

      <section className="rounded border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2.5 mb-4">How it works</h2>
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded border border-gray-200 bg-[#F8F9FB] px-2.5 py-1.5 font-medium text-gray-700">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cobalt text-[9px] text-white font-bold">{i + 1}</span>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="text-gray-300">→</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded border border-gray-200 bg-white shadow-sm p-5 text-sm text-gray-700">
        <h2 className="font-semibold text-gray-800 border-b border-gray-200 pb-2.5 mb-3">About the data</h2>
        <p className="leading-relaxed">
          All streetlight records and training data are <strong>synthetic</strong>, generated around Indore for demonstration purposes.
          Locations are approximate. The model has learned patterns built into the data generator, so its accuracy
          {res.data ? ` (ROC-AUC ${res.data.model_auc})` : ''} is not indicative of real-world performance.
          Replace <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-mono">backend/data/streetlights.json</code> and retrain
          with real inspection and failure logs before any production use.
        </p>
      </section>

      <section className="rounded border border-gray-200 bg-white shadow-sm p-5 text-sm">
        <h2 className="font-semibold text-gray-800 border-b border-gray-200 pb-2.5 mb-3">Technology stack</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Frontend</span> React + Vite + Tailwind CSS</div>
          <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Backend</span> FastAPI (Python)</div>
          <div className="flex items-center gap-2"><span className="font-medium text-gray-700">ML model</span> Random Forest (scikit-learn)</div>
          <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Maps</span> Leaflet.js + React-Leaflet</div>
          <div className="flex items-center gap-2"><span className="font-medium text-gray-700">IoT sim</span> FastAPI background simulation</div>
          <div className="flex items-center gap-2"><span className="font-medium text-gray-700">Charts</span> Recharts</div>
        </div>
      </section>

      <ApiState {...res}><span /></ApiState>
    </div>
  )
}
