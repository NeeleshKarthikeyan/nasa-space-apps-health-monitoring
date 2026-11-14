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
import pandas as pd
from pathlib import Path
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

REPO_ROOT = Path(__file__).parent.parent
DATA_DIR = Path(__file__).parent / "placeholder"

CREW_CSV = REPO_ROOT / "data" / "processed" / "crew_daily.csv"
MODEL_FILE = REPO_ROOT / "model" / "output" / "model_output.json"
BASELINE_FILE = REPO_ROOT / "model" / "output" / "baseline.json"
ALERTS_FILE = REPO_ROOT / "explain" / "output" / "alerts.json"
MISSION = DATA_DIR / "mission.json"



@app.get("/api/mission")
def mission():
    path = DATA_DIR / "mission.json" 
    mission_path = MISSION    
    if not path.exists():                 
        raise HTTPException(status_code=404, detail="Not found")   
    with open(path) as f:                
        return json.load(f)

@app.get("/api/crew")
def crew():
    path = MODEL_FILE   
    if not path.exists():                 
        raise HTTPException(status_code=404, detail="Not found")   
    with open(path) as f:                
        records = json.load(f)
    path = MISSION
    with open(path) as f:                
        mission = json.load(f)
    return [r for r in records if r['mission_day'] == mission['current_day']]
    


@app.get("/api/crew/{astronaut_id}/timeseries") 
def timeseries(astronaut_id: str):
    path = DATA_DIR / (f"timeseries_{astronaut_id}.json")    
    if not path.exists():                 
        raise HTTPException(status_code=404, detail="Not found")   
    with open(path) as f:                
        return json.load(f)

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


#python -m uvicorn main:app --reload   

#C:\Users\fahim\nasa-space-apps-health-monitoring\model\output\model_output.json
# C:\Users\fahim\nasa-space-apps-health-monitoring\data\processed\crew_daily.csv
# C:\Users\fahim\nasa-space-apps-health-monitoring\explain\output\alerts.json