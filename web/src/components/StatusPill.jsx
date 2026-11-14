/*
 * StatusPill: the small rounded badge that says "Nominal", "Watch" or "Act".
 * Used on the crew cards and the astronaut page.
 *
 * A SIMPLE COMPONENT, good to learn from:
 *   - It receives one PROP, `status` ("green", "amber" or "red"), like this:
 *       <StatusPill status="amber" />
 *   - The curly braces in the function header, ({ status }), pull that prop out by name.
 *   - It returns JSX: what to draw. `style={{ ... }}` sets CSS directly; the outer braces
 *     mean "JavaScript", the inner braces are a JavaScript object of CSS properties.
 *   - `const Icon = s.icon` lets us draw a component that was chosen at runtime as <Icon />.
 */
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
