import { crewInfo } from '../crew'
import { statusOf } from '../status'

// One calm sentence that answers "Is everyone OK today?"
export default function TodayBanner({ crew }) {
  const flagged = crew.filter((a) => a.status !== 'green')
  const worst = flagged.some((a) => a.status === 'red') ? 'red' : flagged.length ? 'amber' : 'green'
  const s = statusOf(worst)
  const Icon = s.icon
  const radiation = crew.filter((a) => a.top_reason.includes('Radiation')).length >= 2

  const headline =
    flagged.length === 0
      ? 'All crew are within their normal ranges.'
      : `${flagged.length} of ${crew.length} crew need attention today.`
  const names = flagged.map((a) => `${crewInfo(a.astronaut_id).callsign} (${statusOf(a.status).word})`).join(', ')

  return (
    <section className="banner" style={{ '--accent': s.color }}>
      <span className="icon-tile big" style={{ color: s.color, background: `${s.color}1f` }}>
        <Icon size={22} />
      </span>
      <div>
        <p className="banner-title">{headline}</p>
        {flagged.length > 0 && (
          <p className="muted">
            {names}
            {radiation && ' · Crew-wide radiation spike, likely a solar particle event.'}
          </p>
        )}
      </div>
    </section>
  )
}
