import { RISK_COLOR, RISK_LABEL } from '../utils/risk'

export default function RiskBadge({ level }) {
  const c = RISK_COLOR[level] || '#4B5563'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ color: c, background: `${c}14` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {RISK_LABEL[level] || level}
    </span>
  )
}
