# Data contract (FROZEN at kickoff)

This file is the single source of truth for every format passed between folders.
**Do not change a field name, type or unit without telling the whole team first.** Only Neelesh edits this file.

## Pipeline
```
data/processed/crew_daily.csv  ->  model/output/model_output.json  ->  explain/output/alerts.json  ->  api  ->  web
        (Jayden)                          (Talal)                            (Shyam)                  (Fahim)  (Riyaz)
```

## 1. `data/processed/crew_daily.csv`: one row per astronaut per mission day
| Column | Type | Unit | Notes |
| --- | --- | --- | --- |
| astronaut_id | str | | A, B, C, D |
| mission_day | int | day | 1 to 60 |
| resting_hr_bpm | float | beats/min | |
| hrv_ms | float | ms | heart rate variability |
| sleep_h | float | hours | |
| spo2_pct | float | % | 0 to 100 |
| systolic_bp_mmhg | float | mmHg | |
| body_mass_kg | float | kg | |
| exercise_min | float | minutes | |
| reaction_time_ms | float | ms | mean of a short reaction-time test |
| mood_1to5 | int | 1 to 5 | self-reported |
| radiation_mgy | float | mGy/day | |
| cumulative_dose_msv | float | mSv | running total |
| scenario | str | | ground-truth label for evaluation ONLY; the model must never read it |

Missing reading = empty cell (not 0).

## 2. `model/output/model_output.json`: list, one record per astronaut per day
```json
{"astronaut_id": "B", "mission_day": 47, "anomaly_score": 0.78, "status": "amber",
 "top_signals": [{"signal": "sleep_h", "value": 5.4, "baseline": 7.1, "z": -2.6}],
 "hazards": ["isolation", "radiation"]}
```
`status` is one of `green`, `amber`, `red`. `anomaly_score` is 0 to 1.

## 3. `explain/output/alerts.json`: list, one record per non-green day
```json
{"alert_id": "B-47", "astronaut_id": "B", "mission_day": 47, "status": "amber",
 "title": "Fatigue building over 3 days",
 "explanation": "Sleep is 2 hours below your normal and reaction time has slowed by 15%.",
 "actions": ["Protected 8-hour sleep period", "Repeat reaction test in 12 hours"],
 "escalate_to_earth": false, "sources": ["https://www.nasa.gov/hrp/risks/"]}
```

## 4. API endpoints
| Method | Path | Returns |
| --- | --- | --- |
| GET | `/api/mission` | `{"mission": "mars", "day": 47, "one_way_delay_min": 12}` |
| GET | `/api/crew` | Each astronaut with latest status, score, top reason |
| GET | `/api/crew/{id}/timeseries` | Daily rows plus baseline per signal (shape: agree Riyaz + Fahim) |
| GET | `/api/alerts?astronaut_id=` | Alerts, newest first |
| POST | `/api/checkin` | Reaction times from the live test -> updated status (optional) |

Example values are illustrative, not medical thresholds.
