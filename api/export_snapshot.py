"""Fallback export for the dashboard.

Calls each GET endpoint on the running API and saves the response to web/src/fallback/.
The dashboard loads these files if the live API doesn't answer within 5 seconds,
so the demo never shows a spinner.

Start the API first, then run from the repo root: python api/export_snapshot.py
Rerun after any change to the data, model or alerts, then commit the files.
"""

import json
import requests
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent              # repo root, built from this file's location
OUT_DIR = REPO_ROOT / "web" / "src" / "fallback"      # inside the dashboard code, so it ships with the site
BASE = "http://localhost:8000"                        # the API running locally

# Each endpoint to save, and the file name the dashboard expects for it
EXPORTS = [
    ("/api/mission", "mission.json"),
    ("/api/crew", "crew.json"),
    ("/api/alerts", "alerts.json"),
    ("/api/crew/A/timeseries", "timeseries_A.json"),
    ("/api/crew/B/timeseries", "timeseries_B.json"),
    ("/api/crew/C/timeseries", "timeseries_C.json"),
    ("/api/crew/D/timeseries", "timeseries_D.json"),
]

OUT_DIR.mkdir(parents=True, exist_ok=True)

for path, filename in EXPORTS:
    resp = requests.get(BASE + path)
    # Stop if a request failed, so an error message never gets saved as fallback data
    resp.raise_for_status()
    # Overwrite the old copy so the fallback always matches the latest data
    with open(OUT_DIR / filename, "w") as f:
        json.dump(resp.json(), f, indent=2)
    print("saved", filename)