# model/ (owner: Talal)

| Path | What it is |
| --- | --- |
| `baseline.py` | Per-astronaut mean and spread per signal (mission days 1 to 14) |
| `detect.py` | z-scores, 3-day rolling drift, status rules, Isolation Forest, top signals |
| `evaluate.py` | Precision and recall against the `scenario` labels; checks the exercise trap stays green |
| `notebooks/` | Exploration only. Anything the pipeline needs must live in a `.py` file |
| `output/model_output.json` | Contract section 2. Read by explain/ |

Rule: `detect.py` must drop the `scenario` column before doing anything. Only `evaluate.py` may read it.
