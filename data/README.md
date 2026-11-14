# data/ (owner: Jayden, with Fahim on NASA data)

| Path | What it is | Committed? |
| --- | --- | --- |
| `generate_crew.py` | Simulates 4 astronauts x 60 days with planted scenarios | yes |
| `fetch_nasa.py` | Downloads real NASA data ONCE and saves it to `nasa_snapshots/` | yes |
| `validate.py` | Checks `raw/` output against the contract, writes `processed/` | yes |
| `raw/` | Untouched generator output | yes (small) |
| `nasa_snapshots/` | Untouched NASA downloads, never edited by hand | yes |
| `processed/crew_daily.csv` | Validated file everyone else reads | yes |

## Rules
- Fix the random seed so everyone gets identical data.
- Never edit files in `raw/` or `nasa_snapshots/` by hand; change the script and re-run.
- Missing reading = empty cell, never 0.

## Planted scenarios (the `scenario` column)
| Label | Astronaut | Days | Signals that move |
| --- | --- | --- | --- |
| `normal` | all | most days | none beyond noise |
| `fatigue_spe` (hero) | B | ~44 to 50 | sleep down, resting HR up, reaction time up, mood down, radiation spike |
| `bone_muscle` | C | slow, from ~20 | body mass and exercise drift down |
| `cardio_drift` | D | ~30 to 40 | resting HR and systolic BP up, HRV down |
| `exercise_trap` | A | 1 day | HR up on a heavy exercise day: should NOT alert |

## What is real vs simulated
- [ ] Fill in once decided, with source links. This text goes straight into the main README.
