import { Link } from 'react-router-dom'

// Status is shown as colour AND a word AND an icon, so it works for colour-blind viewers
const STATUS = {
  green: { word: 'Nominal', icon: '✓' },
  amber: { word: 'Watch', icon: '!' },
  red: { word: 'Act', icon: '✕' },
}

export default function StatusCard({ astronaut }) {
  const s = STATUS[astronaut.status] ?? STATUS.green

  return (
    <Link to={`/astronaut/${astronaut.astronaut_id}`} className={`card status-${astronaut.status}`}>
      <div className="card-top">
        <h2>{astronaut.name}</h2>
        <span className="badge">
          <span aria-hidden="true">{s.icon}</span> {s.word}
        </span>
      </div>
      <p className="score">Anomaly score {Math.round(astronaut.anomaly_score * 100)}%</p>
      <p className="reason">{astronaut.top_reason}</p>
    </Link>
  )
}