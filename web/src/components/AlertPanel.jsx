import { useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { getAlerts } from '../api'
import { statusOf } from '../status'
import EscalateCard from './EscalateCard'

export default function AlertPanel({ id, day, delay }) {
  const [alerts, setAlerts] = useState(null)
  const [done, setDone] = useState({}) // ticked actions, keyed "alertId:action"

  useEffect(() => {
    getAlerts(id, day).then(({ data }) => setAlerts(data))
  }, [id, day])

  if (!alerts) return null

  // Only today's alert matters; an older one has already passed
  const today = alerts.find((a) => a.mission_day === day)

  if (!today) {
    return (
      <section className="alert-panel is-clear" style={{ '--accent': statusOf('green').color }}>
        <p className="escalate-title">
          <CircleCheck size={16} color={statusOf('green').color} /> No alerts today. All signals are within
          your normal range.
        </p>
      </section>
    )
  }

  const s = statusOf(today.status)
  const Icon = s.icon
  const key = (action) => `${today.alert_id}:${action}`
  const doneCount = today.actions.filter((a) => done[key(a)]).length

  return (
    <section className="alert-panel" style={{ '--accent': s.color }}>
      <div className="alert-head">
        <span className="icon-tile big" style={{ color: s.color, background: `${s.color}1f` }}>
          <Icon size={22} />
        </span>
        <div>
          <h3>{today.title}</h3>
          <p className="alert-text">{today.explanation}</p>
        </div>
      </div>

      <div className="alert-body">
        <div>
          <p className="mono-label">
            What to do now · {doneCount}/{today.actions.length} done
          </p>
          <ul className="checklist">
            {today.actions.map((a) => (
              <li key={a}>
                <label className={done[key(a)] ? 'is-done' : ''}>
                  <input
                    type="checkbox"
                    checked={!!done[key(a)]}
                    onChange={() => setDone((prev) => ({ ...prev, [key(a)]: !prev[key(a)] }))}
                  />
                  <span>{a}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="sources">
            {today.sources.map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                Source {i + 1}
              </a>
            ))}
          </p>
        </div>
        {/* key= makes the card start fresh for each new alert */}
        <EscalateCard key={today.alert_id} alert={today} delay={delay} />
      </div>
    </section>
  )
}
