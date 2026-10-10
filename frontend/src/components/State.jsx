import { AlertTriangle, Loader2 } from 'lucide-react'

export default function ApiState({ loading, error, reload, children, data }) {
  if (error) {
    return (
      <div className="glass mx-auto mt-10 max-w-lg rounded-2xl p-6 text-sm">
        <div className="flex items-center gap-2 font-medium text-bad"><AlertTriangle size={18} /> Could not load data</div>
        <p className="mt-2 text-gray-700">{error}</p>
        <button className="btn mt-4" onClick={reload}>Try again</button>
      </div>
    )
  }
  if (loading && !data) {
    return <div className="grid place-items-center py-24 text-gray-500"><Loader2 className="animate-spin" /></div>
  }
  return children
}
