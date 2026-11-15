# Explainability and AI Insights

**Owner:** Shyam  
**Project:** Astronaut Health Monitor — NASA Space Apps Challenge 2026

## Overview

Role:
- To build the explainability component
- It takes the anomalies detected by Talal's model and provide explanations for them
- Alongside explanations, suggested actions and earth escalation decisions are provided
- This system uses simulated health data and does not provide medical diagnoses or validate clinical recommendations

## File Structure

| Path | Description |
|---|---|
| `explain.py` | Generates alerts from the model output |
| `hazard_map.csv` | Maps health signals to NASA risks, explanation templates, actions, escalation rules and sources |
| `output/alerts.json` | Generated alert data consumed by the backend |
| `../tests/test_explain.py` | Automated tests for explanation and escalation logic |

## Inputs

The module reads:

- `model/output/model_output.json` — Talal's anomaly detection results.
- `explain/hazard_map.csv` — Health risk mappings, explanations and suggested actions.

Each model record contains an astronaut ID, mission day, anomaly score, status, top signals and associated hazards.

The module uses the model's predicted results and does not access the ground-truth `scenario` column.

## Explanation Generation

For each astronaut and mission day:

1. Ignore records with `green` status.
2. Generate one alert for each `amber` or `red` record.
3. Identify the primary flagged measurement.
4. Compare its current reading against the astronaut's personal baseline.
5. Generate a concise, human-readable explanation.
6. Retrieve relevant research context, suggested actions and source links from `hazard_map.csv`.
7. Apply the escalation rules.
8. Export the structured alert.

The dashboard explanation is limited to approximately one or two sentences. Supporting monitoring actions and source links are returned separately.

The generated JSON follows `docs/data-contract.md`, section 3.

## Earth Escalation Rules

The current prototype applies these rules:

| Status | Escalation |
|---|---|
| Green | No alert or escalation |
| Amber — first consecutive day | Onboard monitoring |
| Amber — second consecutive day | Escalate to Earth |
| Red | Escalate to Earth immediately |

A green day, a red day or a gap in consecutive mission-day records resets the amber streak.

These thresholds are project-defined demonstration rules, not NASA-approved medical escalation criteria, and should be reviewed by the team integration lead.

The `escalate_to_earth` field represents a decision-support recommendation. Generating an alert does not itself transmit a message to Mission Control.

## Simulated Radiation Data

Radiation measurements are simulated and should not be presented as real astronaut exposure data.

The crew-wide solar event scenario draws on the timing of a historical NASA DONKI solar particle event. The radiation values and personal baselines are simulated placeholders.

Radiation explanations explicitly identify the readings as simulated and avoid making unsupported health claims.

## Output

The module writes:

`explain/output/alerts.json`

Each alert contains:

- `alert_id`
- `astronaut_id`
- `mission_day`
- `status`
- `title`
- `explanation`
- `actions`
- `escalate_to_earth`
- `sources`

The FastAPI backend reads this file and provides alerts to the React dashboard.

## Running the Module

From the repository root, run:

`python explain/explain.py`

To regenerate model results first, run:

`python model/detect.py`

Then rerun the explanation generator.

## Testing

Run the automated tests from the repository root:

`python -m unittest discover -s tests -p "test_explain.py" -v`

The tests verify:

1. Green records generate no alerts.
2. A single amber day does not escalate.
3. Two consecutive amber days trigger escalation.
4. Red alerts escalate immediately.
5. A gap between amber days resets the escalation streak.

## Integration Verification

Using the team's 240-record simulation dataset, the latest tested pipeline generated:

- **38 alerts**
- **28 Earth escalations**
- **13 red alerts**, all escalated
- **5 passing automated tests**

On mission Day 47, all four astronauts received amber alerts associated with the simulated crew-wide radiation event, with Earth escalation enabled.

The alert explanations, monitoring actions, source links and escalation panel were verified in the live FastAPI-connected React dashboard.

These results describe the tested dataset and may change when the simulation or anomaly detector is updated.

## Limitations
- Health measurements and radiation doses are simulated
- NASA/CSA references provide research context, not medical diagnoses or any approved procedures
- Earth escalation feature is a prototype decision-support workflow, not a real transmissio to mission control 

## References

The research context and source URLs are stored in `hazard_map.csv` and listed in the repository's `REFERENCES.md`.

NASA HRP and CSA references inform the risk categories. The suggested actions are prototype monitoring guidance rather than approved medical procedures.