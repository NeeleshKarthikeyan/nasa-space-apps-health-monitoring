# api/ (owner: Fahim)

**Live API:** https://astro-health-api-f899.onrender.com  
**Live docs:** https://astro-health-api-f899.onrender.com/docs

| Path | What it is |
| --- | --- |
| `main.py` | FastAPI app serving the GET endpoints in docs/data-contract.md, section 4 |
| `export_snapshot.py` | Saves every endpoint's response to `web/src/fallback/` for the dashboard's offline fallback |
| `test_api.ps1` | Checks every endpoint returns the expected status code (local or deployed) |
| `placeholder/mission.json` | Mission name, current day and comms delay. Owned by the API; change `current_day` here to change the demo day |
| `requirements.txt` | Only what the deployed server needs |

## Endpoints

| Method | Path | Returns | Reads from |
| --- | --- | --- | --- |
| GET | `/api/mission` | Mission name, current day, one-way comms delay | `api/placeholder/mission.json` |
| GET | `/api/crew` | One record per astronaut for the current mission day | `model/output/model_output.json` |
| GET | `/api/crew/{id}/timeseries` | Daily readings with a status per day, plus a personal baseline (mean, low, high per signal) | `data/processed/crew_daily.csv` and `model/output/model_output.json` |
| GET | `/api/alerts` | Alerts, newest first. Optional `?astronaut_id=B` filter | `explain/output/alerts.json` |

`POST /api/checkin` (Hook 1) is in the contract but not built.

Notes:
- Baseline = each astronaut's mission days 1 to 14, band = mean ± 2 standard deviations.
- Missing readings are sent as `null`, never 0.
- The `scenario` column (test answer key) is never sent.
- Unknown astronaut IDs return 404.

## Run locally (PowerShell, from the repo root)

```powershell
python -m venv api/.venv
.\api\.venv\Scripts\Activate.ps1
pip install -r api/requirements.txt
```

```powershell
cd api
python -m uvicorn main:app --reload    # docs at http://127.0.0.1:8000/docs
```

## Test

With the server running, from the repo root:

```powershell
.\api\test_api.ps1                                              # local
.\api\test_api.ps1 https://astro-health-api-f899.onrender.com   # deployed
```

## Update the fallback

With the server running, from the repo root:

```powershell
python api/export_snapshot.py
```

Rerun after any change to the data, model or alerts, then commit `web/src/fallback/`.

## Deploy (Render, free tier)

- Root Directory: `api`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Auto-deploy is off. After pushing, go to **Manual Deploy**, then **Deploy latest commit**.
- The free instance sleeps after about 15 minutes idle and takes about 50 seconds to wake. The dashboard's fallback covers this.

## Rules
- Read only from `data/processed/`, `model/output/`, `explain/output/` (plus `api/placeholder/mission.json`). Never call a NASA API live.
- CORS is open to all origins, so both the local and the deployed frontend can call the API.
- Share the deployed URL in OneDrive > Space Apps 2026 > 00_Start_Here > Links.