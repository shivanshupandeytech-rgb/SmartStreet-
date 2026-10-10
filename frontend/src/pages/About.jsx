import ApiState from '../components/State'
import { useApi } from '../hooks/useApi'
import { api } from '../services/api'

const STEPS = ['Streetlight readings', 'Feature processing', 'Random Forest model', 'Risk rating', 'Maintenance priority', 'Dashboard and map']

export default function About() {
  const res = useApi(api.stats)
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">About SmartStreet</h1>
      <p className="text-sm text-gray-700">SmartStreet helps a municipal team find streetlights that are about to fail, not only the ones that already have. It scores every pole, rates it Healthy, Watch or High risk, and puts the most urgent jobs at the top of the maintenance queue.</p>
      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-semibold">How it works</h2>
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          {STEPS.map((s, i) => (<li key={s} className="flex items-center gap-2"><span className="rounded-lg bg-white/80 px-2.5 py-1.5 font-medium">{s}</span>{i < STEPS.length - 1 && <span className="text-gray-400">&rarr;</span>}</li>))}
        </ol>
      </section>
      <section className="glass rounded-2xl p-4 text-sm text-gray-700">
        <h2 className="mb-2 font-semibold text-ink">About the data</h2>
        <p>All streetlight records and the training data are <b>synthetic</b>, generated around Indore for demonstration. Locations are approximate. The model has learned the patterns built into that generator, so its accuracy{res.data ? ` (ROC-AUC ${res.data.model_auc})` : ''} says nothing about real-world performance. Replace <code>backend/data/streetlights.json</code> and retrain with real inspection and failure logs before any real use.</p>
      </section>
      <ApiState {...res}><span /></ApiState>
    </div>
  )
}
