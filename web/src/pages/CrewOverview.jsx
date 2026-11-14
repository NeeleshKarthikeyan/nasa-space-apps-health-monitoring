import TodayBanner from '../components/TodayBanner'
import StatusCard from '../components/StatusCard'
import CrewTimeline from '../components/CrewTimeline'

// Three things only: today's summary, one widget per crew member, and the mission timeline.
export default function CrewOverview({ crew, history, day, setDay, lastDay }) {
  if (crew.length === 0) return <p className="loading">No crew data for day {day}.</p>

  return (
    <div className="page">
      <TodayBanner crew={crew} />
      <div className="crew-grid">
        {crew.map((a) => (
          <StatusCard key={a.astronaut_id} astronaut={a} />
        ))}
      </div>
      <CrewTimeline history={history} lastDay={lastDay} day={day} setDay={setDay} />
    </div>
  )
}
