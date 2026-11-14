export default function MissionBar({ mission, day, setDay, destination, setDestination }) {
  return (
    <div className="mission-bar">
      <label>
        Destination
        <select value={destination} onChange={(e) => setDestination(e.target.value)}>
          <option value="iss">ISS</option>
          <option value="moon">Moon</option>
          <option value="mars">Mars</option>
        </select>
      </label>
      <label className="day-slider">
        Mission day <strong>{day}</strong>
        <input
          type="range"
          min={1}
          max={mission.day}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        />
      </label>
    </div>
  )
}