# web/ (owner: Riyaz)

## Set up (once)
From the repo root:
```bash
npm create vite@latest web -- --template react   # choose "Ignore files and continue"
cd web
npm install
npm install recharts react-router-dom
npm run dev
```

## Where things go
```
web/src/
  api.js               every fetch lives here: try live API (5 s timeout), else fallback
  mock/                hand-written JSON copied from docs/data-contract.md; use until the API exists
  fallback/            real API responses written by api/export_snapshot.py (committed)
  pages/
    CrewOverview.jsx   a status card per astronaut
    AstronautDetail.jsx  charts per signal with the baseline band, alert panel
    CheckIn.jsx        optional: live reaction-time test (Hook 1)
  components/
    StatusCard.jsx     colour AND a word/icon, so it works for colour-blind viewers
    BaselineChart.jsx  Recharts line + shaded baseline band, flagged days marked
    AlertPanel.jsx     explanation, actions, sources
    EscalateCard.jsx   onboard vs Earth decision, with comms delay
    MissionBar.jsx     mission selector (ISS / Moon / Mars) and day slider
```

Rule: no component calls `fetch` directly. Everything goes through `api.js`, so switching
from mock to live API means changing one URL.
