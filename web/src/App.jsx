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

  if (!mission || !history) {
    return (
      <div className="boot">
        <p className="eyebrow">Contacting mission control</p>
        <p className="muted">Loading crew data…</p>
      </div>
    )
  }

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
