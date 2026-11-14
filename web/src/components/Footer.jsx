/*
 * Footer: the badges and disclaimer at the bottom of every page.
 * PROPS: live (true = live API, false = saved backup files).
 * The disclaimer matters: this is decision support on simulated data, not a medical device.
 */
export default function Footer({ live }) {
  return (
    <footer className="footer">
      <div className="pills">
        <span className={`pill ${live ? 'pill-live' : 'pill-offline'}`}>
          {live ? 'Live data' : 'Offline copy'}
        </span>
        <span className="pill">Simulated crew data</span>
      </div>
      <p>
        Prototype decision support using simulated crew data. It does not diagnose. Always follow
        mission medical procedures and the crew medical officer.
      </p>
    </footer>
  )
}
