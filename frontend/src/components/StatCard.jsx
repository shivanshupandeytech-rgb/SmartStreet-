export default function StatCard({ icon: Icon, label, value, tone = '#111827' }) {
  return (
    <div className="glass pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${tone}14`, color: tone }}>
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-semibold leading-none tabular-nums">{value ?? '-'}</div>
        <div className="mt-1 truncate text-xs text-gray-600">{label}</div>
      </div>
    </div>
  )
}
