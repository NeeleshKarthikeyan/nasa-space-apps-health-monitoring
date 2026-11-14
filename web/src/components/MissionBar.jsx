/*
 * MissionBar: the header with the day number, the destination selector, and the
 * play button + day slider. Used on every page (it's drawn by App).
 * PROPS: mission, day, setDay, destination, setDestination, delay. They all come from App,
 * so changing the day here changes it for the whole dashboard.
 *
 * HOW THE PLAY BUTTON WORKS (useState + useEffect + setInterval):
 *   - `playing` is local STATE: does the user want playback on?
 *   - The EFFECT starts a timer (setInterval) that adds one day every 600 ms.
 *   - The function the effect RETURNS is the "clean-up": React runs it before the effect runs
 *     again or when the component disappears, so the timer is always stopped properly.
 *   - The list at the end of useEffect, [isPlaying, mission.day, setDay], says WHEN to re-run
 *     the effect: only when one of those values changes.
 *   - setDay((d) => ...) uses the latest day value, which is the safe way to update state
 *     from inside a timer.
 */
import { useEffect, useState } from 'react'
import { Play, Pause, Radio } from 'lucide-react'

export default function MissionBar({ mission, day, setDay, destination, setDestination, delay }) {
  const [playing, setPlaying] = useState(false)
  // Worked out on every draw: are we on the last day? Is playback actually running?
  const atEnd = day >= mission.day
  const isPlaying = playing && !atEnd

  // While playing, move forward one day every 600 ms. It stops by itself at the last day.
  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => setDay((d) => Math.min(d + 1, mission.day)), 600)
    return () => clearInterval(timer) // clean up when paused or when the page changes
  }, [isPlaying, mission.day, setDay])

  const togglePlay = () => {
    if (isPlaying) return setPlaying(false)
    if (atEnd) setDay(1) // at the end, play restarts from day 1
    setPlaying(true)
  }

  return (
    <header className="mission-bar">
      <div className="mission-title">
        <p className="eyebrow">ARES-1 · {mission.label}</p>
        <h1>
          Day {day} <em>of {mission.day}</em>
        </h1>
      </div>

      <div className="mission-controls">
        <label className="chip">
          <Radio size={14} />
          <select value={destination} onChange={(e) => setDestination(e.target.value)} aria-label="Destination">
            <option value="iss">ISS</option>
            <option value="moon">Moon</option>
            <option value="mars">Mars</option>
          </select>
          <span className="muted">{delay.text} to Earth</span>
        </label>
        <div className="player">
          <button
            type="button"
            className="play-button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause mission replay' : 'Play mission replay'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <input
            type="range"
            min={1}
            max={mission.day}
            value={day}
            aria-label="Mission day"
            onChange={(e) => {
              setPlaying(false) // dragging the slider stops the replay
              setDay(Number(e.target.value))
            }}
          />
        </div>
      </div>
    </header>
  )
}
