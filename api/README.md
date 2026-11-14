# api/ (owner: Fahim)

| Path | What it is |
| --- | --- |
| `main.py` | FastAPI app serving the 5 endpoints in docs/data-contract.md, section 4 |
| `export_snapshot.py` | Saves every endpoint's response to `web/src/fallback/` for the dashboard's offline fallback |
| `requirements.txt` | Only what the deployed server needs |

Run locally:
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload    # docs at http://127.0.0.1:8000/docs
```

Rules
- Read only from `data/processed/`, `model/output/`, `explain/output/`. Never call a NASA API live.
- Enable CORS for the frontend's local and deployed URLs.
- Share the deployed URL in OneDrive > Space Apps 2026 > 00_Start_Here > Links.
