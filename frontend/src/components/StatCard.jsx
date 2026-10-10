export default function StatCard({ icon: Icon, label, value, tone = '#17365D' }) {
  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded bg-white border border-gray-200 shadow-sm px-4 py-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded"
        style={{ background: `${tone}18`, color: tone }}
      >
        <Icon size={20} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-semibold leading-none tabular-nums text-ink">{value ?? '—'}</div>
        <div className="mt-0.5 truncate text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}
