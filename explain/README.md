# explain/ (owner: E.S)

| Path | What it is |
| --- | --- |
| `hazard_map.csv` | One row per signal: NASA risk, hazard, explanation template, action, escalation rule, source URL |
| `explain.py` | Turns model output into alerts using `hazard_map.csv` |
| `output/alerts.json` | Contract section 3. Read by the API |

Rules
- Every explanation and action must trace to a source URL in `hazard_map.csv`.
- Use "flag", "monitor", "suggest". Never "diagnose".
- Red always escalates to Earth; amber escalates only if it persists (decide how many days and write it here).
