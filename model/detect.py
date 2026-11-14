"""Anomaly detection. Owner: Talal.

Input:  data/processed/crew_daily.csv
Output: model/output/model_output.json (docs/data-contract.md, section 2)

TODO
1. Drop the `scenario` column immediately.
2. z-score every signal against baseline.py; add a 3-day rolling mean of z.
3. Rule-based status first (explainable, works from hour one); tune with E.S.
4. Isolation Forest per astronaut on the z-scores as a second opinion.
5. top_signals = the 3 largest absolute z-scores.
"""

import json

import numpy as np 
import pandas as pd

from sklearn.ensemble import IsolationForest

from baseline import BASELINE_LAST_DAY, CREW_CSV, ROOT, SIGNALS, compute_baselines

OUTPUT_PATH = ROOT / "model" / "output" / "model_output.json"
HAZARD_MAP_PATH = ROOT / "explain" / "hazard_map.csv"

# +1: Higher is worse, -1: lower is worse
BAD_DIRECTION = {
    "resting_hr_bpm": +1, "hrv_ms": -1, "sleep_h": -1, "spo2_pct": -1,
    "systolic_bp_mmhg": +1, "body_mass_kg": -1, "exercise_min": -1,
    "reaction_time_ms": +1, "mood_1to5": -1, "radiation_mgy": +1,
}

# Radiation is Context ("a solar storm is happening"), not a body signal
# It can add to the amber count but can never make someone red on its own.
CONTEXT_SIGNALS = {"radiation_mgy"}

ROLLING_DAYS = 3
RED_SINGLE = 3.5 # one body signal this bad (rolling) -> red
RED_MULTI, RED_MULTI_COUNT = 2.5, 3 # or 3+ body signals this bad -> red
AMBER_SINGLE = 2.0
AMBER_MULTI, AMBER_MULTI_COUNT = 1.5, 2 # or 2+ signals (incl. radiation) -> amber

HEAVY_EXERCISE_Z = 1.5 # on heavy exercise days, ignore resting HR (the exercise trap)
IF_UPGRADE_SCORE = 0.65 # Isolation Forest score that may lift green -> amber...
IF_UPGRADE_MIN_Z = 1.0 #....only if at least one signal is also drifting 
Z_CLIP = 5.0
RADIATION_SPIKE_Z = 5.0 # a radiation spike this big -> amber for everyone 
SEED = 2026

def add_z_scores(df: pd.DataFrame, baselines: dict) -> pd.DataFrame:
    df = df.copy()
    for sig in SIGNALS: 
        mean = df["astronaut_id"].map(lambda a: baselines[a][sig]["mean"])
        std = df["astronaut_id"].map(lambda a: baselines[a][sig]["std"])
        df[f"base_{sig}"] = mean
        df[f"z_{sig}"] = (df[sig] - mean) / std
        df[f"bz_{sig}"] = df[f"z_{sig}"] * BAD_DIRECTION[sig]
    
    # Exercise trap: a high heart rate on a heavy training day is expected, not a warning 
    heavy_exercise = df["z_exercise_min"] >= HEAVY_EXERCISE_Z
    df.loc[heavy_exercise, "bz_resting_hr_bpm"] = np.nan
    
    for sig in SIGNALS:
        df[f"rbz_{sig}"] = df.groupby("astronaut_id")[f"bz_{sig}"].transform(
            lambda s: s.rolling(ROLLING_DAYS, min_periods=2).mean()
        )
    return df

def rule_status(row: pd.Series) -> str:
    rolled = {}
    for s in SIGNALS:
        recent, today = row[f"rbz_{s}"], row[f"bz_{s}"]
        if pd.notna(recent) and pd.notna(today):
            rolled[s] = min(recent, today)
    body = {s: v for s, v in rolled.items() if s not in CONTEXT_SIGNALS}
    
    if (any(v >= RED_SINGLE for v in body.values())
            or sum(v >= RED_MULTI for v in body.values()) >= RED_MULTI_COUNT):
        return "red"
    if (any(v >= AMBER_SINGLE for v in body.values())
        or sum(v >= AMBER_MULTI for v in rolled.values()) >= AMBER_MULTI_COUNT):
      return "amber"  
    if pd.notna(row["bz_radiation_mgy"]) and row["bz_radiation_mgy"] >= RADIATION_SPIKE_Z:
        return "amber"
    return "green"


def isolation_scores(df: pd.DataFrame) -> np.ndarray:
    """
    one forst on all astronauts' baseline days (z-scores are already personal).
    
    Only movement in the bad direction counts (clip at 0), so a great night's sleep
    or a big workout is never "anomalous". Returns 0..1, higher = more unusual.
    """

    cols = [f"bz_{s}" for s in SIGNALS] 
    X = df[cols].clip(lower=0, upper=Z_CLIP).fillna(0.0).to_numpy()
    train = (df["mission_day"] <= BASELINE_LAST_DAY).to_numpy()
    model = IsolationForest(n_estimators=300, random_state=SEED).fit(X[train])
    return -model.score_samples(X) # sklearn returns the negated anomaly score, in (0, 1)

def personal_score(row: pd.Series) -> float:
    """
    0.1 personal score: how close the worst body signal is to the red level.

    Radiation is left out on purpose: it is the environment, not the astronaut.
    0 = right at their normal, 1 = at the red threshold or beyond
    """
    worst = 0.0
    for s in SIGNALS:
        if s in CONTEXT_SIGNALS:
            continue
        recent, today = row[f"rbz_{s}"], row[f"bz_{s}"]
        if pd.notna(recent) and pd.notna(today):
            worst = max(worst, min(recent, today))
    return min(worst / RED_SINGLE, 1.0)


def num(x):
    return None if pd.isna(x) else round(float(x), 2)

def top_signals(row: pd.Series, n: int = 3) -> list:
    candidates = [
        (row[f"bz_{s}"], s) for s in SIGNALS 
        if pd.notna(row[f"bz_{s}"]) and row[f"bz_{s}"] > 0
    ]
    candidates.sort(reverse=True)
    return [
        {"signal": s, "value": num(row[s]), "baseline": num(row[f"base_{s}"]), "z": num(row[f"z_{s}"])}
        for _, s in candidates[:n]
    ]
    
def load_hazard_lookup() -> dict:
    hazard_map = pd.read_csv(HAZARD_MAP_PATH)
    return dict(zip(hazard_map["signal"], hazard_map["hazard"]))

def main():
    df = pd.read_csv(CREW_CSV)
    df = df.drop(columns=["scenario"], errors="ignore") # RULE: never read the labels
    df = df.sort_values(["astronaut_id", "mission_day"]).reset_index(drop=True)

    baselines = compute_baselines(df)
    df = add_z_scores(df, baselines)
    df["if_score"] = isolation_scores(df) # internal second opinion only
    df["anomaly_score"] = df.apply(personal_score, axis=1) # what the dashboard shows
    
    status = df.apply(rule_status, axis=1)
    max_drift = df[[f"rbz_{s}" for s in SIGNALS]].max(axis=1)
    upgrade = (status == "green") & (df["if_score"] >= IF_UPGRADE_SCORE) & (max_drift >= IF_UPGRADE_MIN_Z)
    status[upgrade] = "amber"
    df["status"] = status
    
    hazard_lookup = load_hazard_lookup()
    records = []
    for _, row in df.iterrows():
        tops = top_signals(row)
        hazards = []
        if row["status"] != "green":
            for t in tops:
                h = hazard_lookup.get(t["signal"])
                if h and h not in hazards:
                    hazards.append(h)
        records.append({
            "astronaut_id": str(row["astronaut_id"]),
            "mission_day": int(row["mission_day"]),
            "anomaly_score": num(row["anomaly_score"]),
            "status": row["status"],
            "top_signals": tops,
            "hazards": hazards,
        })
        
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True) 
    with open(OUTPUT_PATH, "w") as f:
        json.dump(records, f, indent=2)

    print(f"Wrote {len(records)} records to {OUTPUT_PATH.relative_to(ROOT)}")
    print(df.groupby(["astronaut_id", "status"]).size().unstack(fill_value=0))

if __name__ == "__main__":
    main()
