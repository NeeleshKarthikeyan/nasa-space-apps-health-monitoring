# [Product name]: Astronaut Health Monitor

NASA Space Apps Challenge 2026, challenge: **Create Health Monitoring Software for Astronauts on Space Missions**.

> Live demo: [link] · API: [link] · Demo video: [link]

## The problem
On long missions, astronauts carry much of the responsibility for spotting changes in their own health. On the way to Mars, help from Earth is minutes of radio delay away.

## What it does
- Compares each astronaut against **their own baseline**, not population averages
- Flags slow drifts across several signals before any single reading looks alarming
- Explains **why** in plain language, links each flag to a NASA spaceflight risk, and says **what to do now**
- Decides whether to handle it onboard or escalate to Earth, showing the comms delay

## What is real and what is simulated
| Data | Status | Source |
| --- | --- | --- |
| Crew vitals, sleep, reaction time, mood | **Simulated** (astronaut medical data is not public) | `data/generate_crew.py` |
| Radiation dose | [Real / simulated] | [NASA OSDR RadLab link] |
| Risks, hazards and explanations | Based on NASA HRP and CSA sources | See `REFERENCES.md` |

This is a prototype for decision support. It does not diagnose and is not a medical device.

## Run it locally
```bash
# 1. Python pipeline: data -> model -> alerts
pip install -r requirements.txt
bash run_pipeline.sh

# 2. API (new terminal)
cd api && pip install -r requirements.txt && uvicorn main:app --reload

# 3. Dashboard (new terminal)
cd web && npm install && npm run dev
```

## Repo layout
| Folder | Owner | What goes there |
| --- | --- | --- |
| `data/` | Jayden | Crew simulator, NASA data fetch, validation |
| `model/` | Talal | Baselines, anomaly detection, evaluation |
| `explain/` | E.S | Signal-to-risk mapping, alert text, escalation rules |
| `api/` | Fahim | FastAPI server and fallback snapshot export |
| `web/` | Riyaz | React dashboard |
| `docs/` | Neelesh | Data contract, demo script, screenshots |

## Team
Riyaz · Fahim · Talal · E.S · Neelesh · Jayden
