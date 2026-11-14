import { useEffect, useState } from 'react'
import { getAlerts } from '../api'
import EscalateCard from './EscalateCard'

export default function AlertPanel({ id, day, delay }) {
  const [alerts, setAlerts] = useState(null)

  useEffect(() => {
    getAlerts(id, day).then(({ data }) => setAlerts(data))
  }, [id, day])

  if (!alerts) return null

  // Only today's alert matters; an older one has already passed
  const today = alerts.find((a) => a.mission_day === day)

  if (!today) {
    return (
      <div className="alert-panel status-green">
        <h3>No alerts today</h3>
        <p>All signals are within your normal range.</p>
      </div>
    )
  }

  return (
    <div className={`alert-panel status-${today.status}`}>
      <h3>{today.title}</h3>
      <p>{today.explanation}</p>
      <h4>What to do now</h4>
      <ul>
        {today.actions.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p className="sources">
        {today.sources.map((url, i) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            Source {i + 1}
          </a>
        ))}
      </p>
      <EscalateCard alert={today} delay={delay} />
    </div>
  )
}