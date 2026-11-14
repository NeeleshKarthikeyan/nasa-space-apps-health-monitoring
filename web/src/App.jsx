/*
 * App.jsx: the top-level component. It loads the shared data and decides which page to show.
 *
 * Layout on screen: Sidebar (left) | MissionBar (top) + the current page + Footer.
 *
 * What App remembers (STATE):
 *   mission      mission info from the API: its name, last day and the radio delay
 *   history      every day's crew status, loaded once at the start: { 1: [...], 2: [...], ... }
 *   day          the day picked with the slider or the play button
 *   live         true = data came from the live API, false = from the saved backup files
 *   destination  ISS, Moon or Mars from the mission bar (it only changes the radio delay)
 *
 * Why does this live in App? A piece of state belongs in the closest component that
 * EVERYTHING using it sits inside. The slider (in MissionBar) changes `day`, and both pages
 * read `day`, so App owns it and passes it down as a prop. Passing `setDay` down as well
 * lets a child component change it.
 */
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { getMission, getCrewHistory } from './api'
import { delayFor } from './destinations'
import CrewOverview from './pages/CrewOverview'
import AstronautDetail from './pages/AstronautDetail'
import Sidebar from './components/Sidebar'
import MissionBar from './components/MissionBar'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const [mission, setMission] = useState(null)
  const [history, setHistory] = useState(null) // every day's crew status: { 1: [...], 2: [...] }
  const [day, setDay] = useState(null)
  const [live, setLive] = useState(true)
  const [destination, setDestination] = useState('mars')

  // Load the mission, then every day's crew status, once when the app starts
  useEffect(() => {
    getMission().then(async ({ data, live }) => {
      const h = await getCrewHistory(data.day)
      setMission(data)
      setHistory(h.data)
      setDay(data.day)
      setLive(live && h.live)
      setDestination(data.mission)
    })
  }, [])

  // While the data is loading, show a simple message. Returning early means nothing below runs yet.
  if (!mission || !history) {
    return (
      <div className="boot">
        <p className="eyebrow">Contacting mission control</p>
        <p className="muted">Loading crew data…</p>
      </div>
    )
  }

  // Worked out fresh on every draw from state; no need to store these separately
  const delay = delayFor(destination, mission)
  const crew = history[day] ?? []

  return (
    <div className="shell">
      <Sidebar crew={crew} live={live} />
      <div className="main">
        <MissionBar
          mission={mission}
          day={day}
          setDay={setDay}
          destination={destination}
          setDestination={setDestination}
          delay={delay}
        />
        {/* <Routes> shows ONE <Route>: the one whose path matches the address.
            ":id" is a placeholder, so #/astronaut/B shows AstronautDetail with id = "B". */}
        <Routes>
          <Route
            path="/"
            element={
              <CrewOverview
                crew={crew}
                history={history}
                day={day}
                setDay={setDay}
                lastDay={mission.day}
              />
            }
          />
          <Route path="/astronaut/:id" element={<AstronautDetail day={day} delay={delay} crew={crew} />} />
        </Routes>
        <Footer live={live} />
      </div>
    </div>
  )
}
