import json
import requests
from pathlib import Path

# Where things are
REPO_ROOT = Path(__file__).parent.parent              # the repo root folder
OUT_DIR = REPO_ROOT / "web" / "src" / "fallback"      # where the copies go
BASE = "http://localhost:8000"                        # your API, running locally

# Which page to visit, and what to name the saved copy
EXPORTS = [
    ("/api/mission", "mission.json"),
    ("/api/crew", "crew.json"),
    ("/api/alerts", "alerts.json"),
    ("/api/crew/A/timeseries", "timeseries_A.json"),
    ("/api/crew/B/timeseries", "timeseries_B.json"),
    ("/api/crew/C/timeseries", "timeseries_C.json"),
    ("/api/crew/D/timeseries", "timeseries_D.json"),
]

# Make sure the folder exists
OUT_DIR.mkdir(parents=True, exist_ok=True)

for path, filename in EXPORTS:
    resp = requests.get(BASE + path)
    resp.raise_for_status()
    with open(OUT_DIR / filename, "w") as f:
        json.dump(resp.json(), f, indent=2)
    print("saved", filename)