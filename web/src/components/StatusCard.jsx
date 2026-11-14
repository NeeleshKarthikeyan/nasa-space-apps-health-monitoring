import { Link } from 'react-router-dom'
import { crewInfo } from '../crew'
import { statusOf } from '../status'
import StatusPill from './StatusPill'
import RingGauge from './RingGauge'

// One crew widget: who, status, anomaly ring and the reason. Nothing else.
export default function StatusCard({ astronaut }) {
  const info = crewInfo(astronaut.astronaut_id)
  const s = statusOf(astronaut.status)

  return (
    <Link to={`/astronaut/${astronaut.astronaut_id}`} className="crew-card" style={{ '--accent': s.color }}>
      <div className="crew-card-top">
        <div className="crew-name">
          <h3>{info.callsign}</h3>
          <p>{info.role}</p>
        </div>
        <StatusPill status={astronaut.status} />
      </div>
      <div className="crew-card-mid">
        <RingGauge value={astronaut.anomaly_score} color={s.color} label="Anomaly score" size={84} />
        <p className="reason">{astronaut.top_reason}</p>
      </div>
    </Link>
  )
}
