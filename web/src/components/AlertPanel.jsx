/*
 * AlertPanel: the right-hand panel on the astronaut page. It shows today's alert:
 * the explanation, a checklist of actions, source links, and the Send to Earth card.
 * PROPS: id (astronaut, e.g. "B"), day, delay, and today's status and reason from the crew data,
 *        so the panel never says "all normal" when the status says otherwise.
 *
 * HOW IT LOADS DATA (useEffect):
 *   The effect asks the API for this astronaut's alerts whenever `id` or `day` changes
 *   (that's what [id, day] at the end means), then saves the answer in state with setAlerts.
 *   Until the answer arrives, `alerts` is null and the panel draws nothing.
 *
 * EARLY RETURNS: a component can `return` different JSX in different situations.
 * Here: nothing yet -> no alert (worded to match today's status) -> the full alert.
 */
import { useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { getAlerts } from '../api'
import { statusOf } from '../status'
import EscalateCard from './EscalateCard'

export default function AlertPanel({ id, day, delay, status, reason }) {
  const [alerts, setAlerts] = useState(null)
  const [done, setDone] = useState({}) // ticked actions, keyed "alertId:action"
  const [expanded, setExpanded] = useState(false) // long explanations start folded to 3 lines

  useEffect(() => {
    getAlerts(id, day).then(({ data }) => setAlerts(data))
  }, [id, day])

  if (!alerts) return null

  // Only today's alert matters; an older one has already passed
  // .find() returns the first item that matches, or undefined if none does
  const today = alerts.find((a) => a.mission_day === day)

  // No alert for today. Word it to match today's status: if the status is Watch or Act but no alert
  // text exists for this day, say so honestly instead of claiming everything is normal.
  if (!today) {
    if (status && status !== 'green' && status !== 'none') {
      const st = statusOf(status)
      const StatusIcon = st.icon
      return (
        <section className="alert-panel" style={{ '--accent': st.color }}>
          <div className="alert-head">
            <span className="icon-tile big" style={{ color: st.color, background: `${st.color}1f` }}>
              <StatusIcon size={22} />
            </span>
            <div>
              <h3>{reason ?? st.word}</h3>
              <p className="alert-text">
                No detailed alert was written for this day. The highlighted widgets show which signals are
                outside your normal range.
              </p>
            </div>
          </div>
        </section>
      )
    }
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
  // Each tick is remembered under "alertId:action", so ticks from one day never show on another
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
          <p className={`alert-text ${expanded ? '' : 'is-clamped'}`}>{today.explanation}</p>
          {today.explanation?.length > 180 && (
            <button type="button" className="link-button" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
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
