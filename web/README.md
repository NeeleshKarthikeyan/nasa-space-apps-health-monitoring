# Crew Health Dashboard (`web/`)

Owner: Riyaz. Part of our NASA Space Apps Challenge 2026 entry for *Create Health Monitoring Software for Astronauts on Space Missions*.

The dashboard answers three questions for each astronaut: **Am I OK? Why not? What do I do now?** It compares every astronaut with their own normal range, flags slow drifts, explains them in plain English, and shows whether to handle a problem onboard or send it to Earth (with the radio delay).

> All crew data is **simulated**. This is a prototype for decision support, not a medical device.

---

## Run it on your laptop

You need [Node.js LTS](https://nodejs.org/) (check with `node --version`).

```powershell
cd web
npm install          # first time only: downloads the libraries
npm run dev          # starts the dashboard at http://localhost:5173
```

**To use the live API**, create a file `web/.env.local` containing one line (no slash at the end). Git ignores this file.

```
VITE_API_URL=https://astro-health-api-f899.onrender.com
```

The API runs on a free server that sleeps when unused. Open <https://astro-health-api-f899.onrender.com/api/mission> in a browser first and wait until text appears, then start (or restart) `npm run dev`.

**Live or offline?** The footer and sidebar say **Live data** when the API answered, or **Offline copy** when the dashboard used the saved backup in `src/fallback/` instead. Both work; the backup means the demo never breaks.

## Build and deploy

```powershell
npm run build        # makes the finished website in web/dist
npm run preview      # check the finished version locally before deploying
```

On [Vercel](https://vercel.com): import the GitHub repo, set **Root Directory** to `web`, add the environment variable `VITE_API_URL` (same value as above), and deploy. The app uses `#` addresses (`/#/astronaut/B`), so refreshing any page works without extra server settings.

---

## How the data flows

```
Fahim's API (or src/fallback/ if it doesn't answer within 5 seconds)
   -> src/api.js        fetches the data and TRANSLATES it into the dashboard's shapes
   -> src/App.jsx       keeps the shared data: mission, every day's crew status, selected day
   -> pages/            CrewOverview (#/) and AstronautDetail (#/astronaut/A..D)
   -> components/       the cards, charts, alert panel and so on
```

`api.js` accepts both Fahim's current API format and the format in `docs/data-contract.md`, so the dashboard keeps working if the API changes.

## Where everything is

| File | What it does |
| --- | --- |
| `src/main.jsx` | Starting point: loads fonts and styles, sets up page addresses, draws `App` |
| `src/App.jsx` | Loads the shared data once, holds the selected day, chooses the page |
| `src/api.js` | Every request to the API, the 5-second fallback, and the translators |
| `src/crew.js` | Call signs and roles (Vega, Lyra, Altair, Rigel). Invented, not real astronauts |
| `src/status.js` | Word, icon and colour for each status (Nominal, Watch, Act) |
| `src/signals.js` | The 10 signals: names, icons, units, hazard groups and colours, plus helpers |
| `src/destinations.js` | Radio delay to Earth for ISS, Moon and Mars |
| `src/pages/CrewOverview.jsx` | Overview page: today's banner, crew cards, mission timeline |
| `src/pages/AstronautDetail.jsx` | Astronaut page: big chart, signal widgets, alert panel |
| `src/components/MissionBar.jsx` | Day number, destination selector, play button and day slider |
| `src/components/Sidebar.jsx` | Navigation on the left |
| `src/components/TodayBanner.jsx` | One-sentence summary of the selected day |
| `src/components/StatusCard.jsx` | One crew member's card |
| `src/components/StatusPill.jsx` | The Nominal / Watch / Act badge |
| `src/components/RingGauge.jsx` | The circular anomaly score gauge |
| `src/components/CrewTimeline.jsx` | Crew by day grid; click a day to jump to it |
| `src/components/BaselineChart.jsx` | The big chart with the shaded "your normal range" band |
| `src/components/SignalWidget.jsx` | A small tile and mini chart per signal |
| `src/components/AlertPanel.jsx` | Today's alert, the action checklist and sources |
| `src/components/EscalateCard.jsx` | Send to Earth, with the (sped-up) transmission |
| `src/components/Footer.jsx` | Live / offline badge and the disclaimer |
| `src/App.css`, `src/index.css` | All styling; `index.css` has the colours, fonts and starfield |
| `src/fallback/` | Saved copies of the API's answers (exported by Fahim) |
| `src/mock/` | Older test data used while building; not used by the app any more |

Every file starts with a comment explaining what it does and which React ideas it uses.

## React in five minutes (for teammates new to it)

- **Component**: a function that returns what to draw, in JSX (HTML-like). Used like a tag: `<StatusPill status="amber" />`. Simplest example: `StatusPill.jsx`.
- **Props**: a component's inputs, passed like attributes. Read-only inside the component.
- **State** (`useState`): something a component remembers; changing it redraws the screen. Example: the selected `day` in `App.jsx`.
- **Effect** (`useEffect`): code that runs after drawing, usually to load data. Example: `AlertPanel.jsx` loads alerts whenever the astronaut or day changes.
- **Lists**: `items.map(item => <Card key={...} />)` draws one element per item. Example: `CrewTimeline.jsx`.
- **Routing**: `App.jsx` shows a different page depending on the address after `#`.
- **Lifting state up**: the day slider is in `MissionBar`, but both pages need the day, so `App` owns it and passes `day` and `setDay` down.

## Data rules the dashboard follows

- A missing reading is `null`: charts show a **break** and widgets say "No reading today". It is never drawn as zero.
- `mood_1to5` is a whole number from 1 to 5, shown as "3 / 5" on a fixed 1 to 5 scale.
- The `scenario` column is the answer key for testing and is **never** shown. Only the 10 signals listed in `signals.js` are displayed, even if the API sends extra columns.
- Each astronaut is compared with their **own** normal range (first 14 days), shown as the shaded band.
- Charts keep fixed axes and the layout stays still, so the mission replay doesn't jump around.

## Common changes

| To change | Edit |
| --- | --- |
| Crew names or roles | `src/crew.js` |
| Status words, icons or colours | `src/status.js` |
| Signal names, units, groups or colours | `src/signals.js` |
| Radio delays | `src/destinations.js` (Mars comes from the API) |
| How fast play moves | `600` in `src/components/MissionBar.jsx` (milliseconds per day) |
| How long to wait for the API | `5000` in `src/api.js` (milliseconds) |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Failed to resolve import "X" from "Y"` | File Y wants file X, and X isn't where Y expects it. Check X's name and folder |
| Always says **Offline copy** | Check `web/.env.local`, wake the API in a browser tab, then restart `npm run dev` |
| `Missing script: "dev"` | You're not in the `web` folder, or the app wasn't created properly. `cd web` and try again |
| Blank page | Press F12 and open Console: the red error names the file and line |

## Built with

All open source: [React](https://react.dev/), [Vite](https://vite.dev/), [React Router](https://reactrouter.com/), [Recharts](https://recharts.org/), [Lucide icons](https://lucide.dev/), and the fonts Manrope, JetBrains Mono and Instrument Serif via [Fontsource](https://fontsource.org/). These are also listed in the repo's `REFERENCES.md`.

## Use of AI

I used Anthropic's Claude as a coding assistant for this dashboard. It helped:
- Write and debug the React components 
- Styling and planning the layout. 
- Commenting on code for readability
- Image generation for logo
  
I directed the design, connected it to our API and models, and tested it. All crew members and health data shown are simulated.
