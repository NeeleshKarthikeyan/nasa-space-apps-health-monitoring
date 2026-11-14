import { statusOf } from '../status'

// Status as icon + word + colour, never colour alone
export default function StatusPill({ status }) {
  const s = statusOf(status)
  const Icon = s.icon
  return (
    <span className="status-pill" style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}14` }}>
      <Icon size={14} aria-hidden="true" />
      {s.word}
    </span>
  )
}
