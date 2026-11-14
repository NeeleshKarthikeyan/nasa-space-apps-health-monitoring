/*
 * CrewOverview: the overview PAGE, shown at #/ (the home page).
 * A "page" is just a component that App's <Route> chooses based on the address.
 * PROPS: crew (today's crew), history (all days), day, setDay, lastDay.
 *
 * It doesn't load any data itself: App loads everything once and passes it down,
 * so moving between pages is instant.
 * Order on screen: TodayBanner, one StatusCard per crew member, then the CrewTimeline.
 */
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
