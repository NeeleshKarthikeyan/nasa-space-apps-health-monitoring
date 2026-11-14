/*
 * main.jsx: the starting point of the whole dashboard. You rarely need to touch it.
 *
 * The browser opens index.html, which loads this file. It:
 *   1. imports the fonts and the global styles (index.css),
 *   2. wraps the app in <HashRouter>, which gives us "pages" without a server:
 *      the part of the address after # decides the page (#/ = overview, #/astronaut/B = Lyra),
 *   3. draws <App /> inside the <div id="root"> in index.html.
 *
 * REACT IN ONE MINUTE (used in every file of this project):
 *   - A COMPONENT is a JavaScript function that returns what to draw, written in JSX
 *     (it looks like HTML). Component names start with a capital letter and are used
 *     like tags: <App />, <StatusPill status="amber" />.
 *   - PROPS are a component's inputs, passed like HTML attributes. Read-only inside it.
 *   - STATE (useState) is something a component remembers. Changing it makes React redraw.
 *   - EFFECTS (useEffect) run code after drawing, for example to load data from the API.
 *   - In JSX, curly braces { } mean "run this JavaScript", e.g. <p>Day {day}</p>.
 *   - <StrictMode> only adds extra checks while developing; it changes nothing on screen.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
// Fonts are installed with npm, so they work offline (no internet needed during the demo)
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
