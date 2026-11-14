/*
 * Sidebar: the navigation on the left (Overview, then one link per crew member).
 * PROPS: crew (for the coloured status dots), live (for the "Live data / Offline copy" note).
 *
 * <NavLink> is a react-router link that automatically gets the CSS class "active" when its
 * page is the one showing; App.css uses that to highlight it. `end` on the Overview link means
 * "only active on exactly #/", not on every page.
 * On narrow screens App.css turns this column into a row along the top.
 */
import { NavLink } from 'react-router-dom'
import { LayoutGrid, Rocket } from 'lucide-react'
import { crewInfo } from '../crew'
import { statusOf } from '../status'

// Left navigation. NavLink adds the class "active" to the current page.
export default function Sidebar({ crew, live }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">
          <Rocket size={16} />
        </span>
        Crew Health
      </div>

      <NavLink to="/" end className="nav-item">
        <LayoutGrid size={16} /> Overview
      </NavLink>

      <p className="nav-label">Crew</p>
      {crew.map((a) => (
        <NavLink key={a.astronaut_id} to={`/astronaut/${a.astronaut_id}`} className="nav-item">
          <span className="dot" style={{ background: statusOf(a.status).color }} />
          {crewInfo(a.astronaut_id).callsign}
        </NavLink>
      ))}

      <div className="sidebar-foot">
        <span className={`live-dot ${live ? 'on' : 'off'}`} />
        {live ? 'Live data' : 'Offline copy'}
      </div>
    </aside>
  )
}
