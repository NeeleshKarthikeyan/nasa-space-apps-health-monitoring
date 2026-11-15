# Explainability and AI Insights

**Owner:** Shyam  
**Project:** Astronaut Health Monitor — NASA Space Apps Challenge 2026

## Overview

My role was to build the explainability part of the project. Talal's model detects unusual astronaut health readings, and my code takes those results and generates explanations for them.

The system also provides suggested actions and decides whether an alert should be escalated to Earth.

## Files

| File | Purpose |
|---|---|
| `explain.py` | Generates explanations and alerts from the model results |
| `hazard_map.csv` | Contains NASA risk mappings, explanation templates, actions and sources |
| `output/alerts.json` | Stores the generated alerts for the backend |
| `../tests/test_explain.py` | Tests the alert generation and escalation rules |

## How It Works

The script reads the results from `model/output/model_output.json`.

- Green readings are ignored as they don't require alerts.
- Amber and red readings are used to generate alerts.
- The current measurements are compared against each astronaut's personal baseline.
- `hazard_map.csv` is used to link flagged measurements to relevant NASA research and suggested actions.
- The generated alerts are saved in `explain/output/alerts.json`, which Fahim's API uses for the dashboard.

The explanations are kept short so they're easier to understand on the dashboard.

The script only uses the model's predictions, not the `scenario` labels used for evaluating the model.

## Escalation Rules

| Status | Action |
|---|---|
| Green | No alert |
| Amber (first day) | Continue onboard monitoring |
| Amber (second consecutive day) | Escalate to Earth |
| Red | Escalate to Earth immediately |

If the amber days are not consecutive, the counter resets. A green or red day also resets the amber counter.

These rules were created for our prototype and aren't official NASA medical thresholds.

## Running the Code

Run the following from the main repository folder:

```bash
python explain/explain.py
```

If the model output needs updating, run:

```bash
python model/detect.py
python explain/explain.py
```

## Testing

To run the tests:

```bash
python -m unittest discover -s tests -p "test_explain.py" -v
```

The tests check that:

- Green readings don't produce alerts.
- A single amber day does not escalate.
- Two consecutive amber days trigger escalation.
- Red alerts escalate immediately.
- Gaps between amber days reset the counter.

## Results

Using our simulated dataset of 240 records, the system generated:

- **38 alerts**
- **28 Earth escalations**
- **13 red alerts**, all escalated
- **5 passing automated tests**

I also tested the integration with the FastAPI backend and React dashboard.

For example, on mission Day 47, the dashboard successfully displayed the simulated radiation alerts, explanations, recommended actions and Earth escalation options.

## Limitations

- All astronaut health readings and radiation doses are simulated.
- The solar event timing was based on historical NASA DONKI data, but the radiation values themselves are simulated.
- NASA and CSA references provide research context, not medical diagnoses or approved treatment procedures.
- Earth escalation is a simulated decision-support feature, not a real transmission to Mission Control.

## References

The NASA and CSA sources used for the explanations are included in `hazard_map.csv` and the project's main `REFERENCES.md` file.