"""API server for the astronaut health monitor.

Serves the crew data, model output and alerts to the dashboard.
Endpoints are listed in docs/data-contract.md, section 4.
Run from the api folder: python -m uvicorn main:app --reload
"""

import json
import pandas as pd
from pathlib import Path
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Let the dashboard call the API from a different address (localhost or its deployed site).
# Open to all origins: there are no logins or private data, so this is fine for the demo.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths are built from this file's location, so they work wherever uvicorn is started
REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = Path(__file__).parent / "placeholder"

CREW_CSV = REPO_ROOT / "data" / "processed" / "crew_daily.csv"       # daily readings for every astronaut
MODEL_FILE = REPO_ROOT / "model" / "output" / "model_output.json"    # anomaly score and status per astronaut per day
ALERTS_FILE = REPO_ROOT / "explain" / "output" / "alerts.json"       # plain-language alerts with recommended actions
MISSION = DATA_DIR / "mission.json"                                  # mission name, current day, comms delay


# Mission info for the dashboard header and the comms delay
@app.get("/api/mission")
def mission():
    path = MISSION
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    with open(path) as f:
        return json.load(f)


# Crew overview: one status card per astronaut for the current mission day
@app.get("/api/crew")
def crew(day: int | None = None):
    path = MODEL_FILE
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    with open(path) as f:
        records = json.load(f)
    path = MISSION
    with open(path) as f:
        mission = json.load(f)
        if day is None:
            return [r for r in records if r['mission_day'] == mission['current_day']]
    return [r for r in records if r['mission_day'] == day]

    # The model file has every astronaut on every day, so keep only the current day

# One astronaut's full history for the charts: daily readings, a status per day,
# and their personal normal range for each signal
@app.get("/api/crew/{astronaut_id}/timeseries")
def timeseries(astronaut_id: str):
    path = CREW_CSV
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    df = pd.read_csv(CREW_CSV)
    keep = df[df['astronaut_id'] == astronaut_id]
    # scenario is the test answer key, so it's never sent to the dashboard
    keep = keep.drop(columns=["scenario"])

    # Columns that aren't health measurements. Cumulative dose only ever goes up,
    # so it has no normal range.
    SKIP = ["astronaut_id", "mission_day", "cumulative_dose_mgy"]
    signals = [c for c in keep.columns if c not in SKIP]
    if keep.empty:
        raise HTTPException(status_code=404, detail="Astronaut not found")

    # Personal baseline from the first 14 days, when the crew is assumed healthy.
    # The normal band is mean ± 2 standard deviations, matching the amber rule.
    base = keep[keep['mission_day'] <= 14]
    baseline = {}
    for col in signals:
        mean = base[col].mean()
        sd = base[col].std()
        baseline[col] = {
            'mean' : round(mean,2),
            'low' : round(mean - 2 * sd,2),
            'high': round(mean + 2 * sd,2),}

    # Missing readings: NaN isn't valid JSON, so send None (null) and the chart shows a gap, not a 0.
    # This comes after the baseline maths, which needs real numbers.
    keep = keep.astype(object).where(keep.notna(), None)
    rows = keep.to_dict(orient="records")

    # Add the model's status to each day so the chart can mark flagged days.
    # If the model file is missing, the days go out without a status instead of crashing.
    if MODEL_FILE.exists():
        with open(MODEL_FILE) as f:
            records = json.load(f)
            status_by_day = {s["mission_day"]: s["status"] for s in records if s["astronaut_id"] == astronaut_id}
        for row in rows:
            row["status"] = status_by_day.get( row["mission_day"])
    return {"astronaut_id": astronaut_id, "days": rows, "baseline":baseline}


# Alerts, newest first. Add ?astronaut_id=B to get one astronaut's alerts only.
@app.get("/api/alerts")
def alert(astronaut_id: str | None = None):
    path = ALERTS_FILE
    if not path.exists():
        raise HTTPException(status_code=404, detail="Not found")
    with open(path) as f:
        alerts = sorted(json.load(f), key=lambda x: x['mission_day'], reverse=True)
        if astronaut_id is None:
            return alerts
        return [n for n in alerts if n['astronaut_id'] == astronaut_id]