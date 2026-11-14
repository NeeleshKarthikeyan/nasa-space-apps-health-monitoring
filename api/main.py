"""API server. Owner: Fahim.

Endpoints (docs/data-contract.md, section 4):
  GET  /api/mission
  GET  /api/crew
  GET  /api/crew/{astronaut_id}/timeseries
  GET  /api/alerts?astronaut_id=
  POST /api/checkin          (optional, Hook 1)

TODO
1. Walking skeleton by 13:00: return hard-coded JSON matching the contract.
2. Then read from data/processed, model/output and explain/output.
3. Add CORS middleware for the dashboard URLs.
"""

import json
from pathlib import Path
from fastapi import FastAPI
from fastapi import HTTPException

app = FastAPI()
DATA_DIR = Path(__file__).parent / "placeholder"

@app.get("/api/mission")
def mission():
    with open(DATA_DIR / "mission.json") as f:
        return json.load(f)

@app.get("/api/crew")
def crew():
    with open(DATA_DIR / "crew.json") as f:
        return json.load(f)

@app.get("/api/crew/{astronaut_id}/timeseries")
def id(astronaut_id: str):
    return {"message": f"hello {astronaut_id}"}

@app.get("/alert")
def alert():
    with open(DATA_DIR / "alert.json") as f:
        return json.load(f)

raise HTTPException(status_code=404, detail="Astronaut not found")
#python -m uvicorn main:app --reload   
#http://localhost:8000/api/greet/Riyaz