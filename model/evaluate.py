"""Evaluation. Owner: Talal.

Input:  data/processed/crew_daily.csv (scenario labels) + model/output/model_output.json
Output: printed precision / recall per scenario, false alarms on normal days,
        and a check that the exercise_trap day stays green.

Report the result honestly in the README: it is measured on synthetic data.
"""

import json 
import sys

import pandas as pd 

from baseline import CREW_CSV, ROOT

MODEL_OUTPUT = ROOT / "model" / "output" / "model_output.json"
NOT_A_PROBLEM = {"normal", "exercise_trap"}
HERO = ("B", 47) # the demo moment: must not be green

def main():
    truth = pd.read_csv(CREW_CSV, usecols=["astronaut_id", "mission_day", "scenario"])
    with open(MODEL_OUTPUT) as f:
        pred = pd.DataFrame(json.load(f))
        
    m = truth.merge(pred[["astronaut_id", "mission_day", "status", "anomaly_score"]],
                    on=["astronaut_id", "mission_day"], how="left", validate="one_to_one")
    if m["status"].isna().any():
        sys.exit(f"FAIL: {m['status'].isna().sum()} days have no model output")
        
    m["flagged"] = m["status"] != "green"
    m["positive"] = ~m["scenario"].isin(NOT_A_PROBLEM)

    tp = int((m.flagged & m.positive).sum())
    fp = int((m.flagged & ~m.positive).sum())
    fn = int((~m.flagged & m.positive).sum())
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0

    print("Measured on SYNTHETIC data.\n")
    print(f"Overall precision {precision:.2f}   recall {recall:.2f}  (TP {tp}, FP {fp}, FN {fn})\n")

    print(f"{'scenario':<14}{'days':>6}{'flagged':>9}{'recall':>8}{'first day':>11}{'caught day':>12}{'delay':>7}")
    for scen, g in m[m.positive].groupby("scenario"):
        first_day = int(g.mission_day.min())
        caught = g[g.flagged]
        caught_day = int(caught.mission_day.min()) if len(caught) else None
        delay = caught_day - first_day if caught_day is not None else "missed"
        print(f"{scen:<14}{len(g):>6}{len(caught):>9}{len(caught) / len(g):>8.2f}"
              f"{first_day:>11}{str(caught_day):>12}{str(delay):>7}")
        
    normal = m[m.scenario == "normal"]
    false_alarms = int(normal.flagged.sum())
    print(f"\nFalse alarms on normal days: {false_alarms}/{len(normal)} ({false_alarms / len(normal):.1%})")
    if false_alarms:
        print(normal[normal.flagged][["astronaut_id", "mission_day", "status"]].to_string(index=False))

    ok = True 
    trap = m[m.scenario == "exercise_trap"]
    if trap.empty:
        print("\nExercise trap: no_exercise_trap rows found (check the data)")
    elif (trap.status == "green").all():
        print("\nExercise trap: PASS (stayed green)")
    else:
        ok = False
        print("\nExercise trap: FAIL")
        print(trap[["astronaut_id", "mission_day", "status"]].to_string(index=False))

    hero = m[(m.astronaut_id == HERO[0]) & (m.mission_day == HERO[1])]
    if not hero.empty:
        s = hero.status.iloc[0]
        print(f"Hero day {HERO[0]}-{HERO[1]}: {s} {'PASS' if s != 'green' else 'FAIL'}")
        ok = ok and s != "green"

    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    raise main()
