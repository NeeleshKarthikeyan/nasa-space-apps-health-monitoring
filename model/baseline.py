"""Personal baselines. Owner: Talal.

Input:  data/processed/crew_daily.csv (days 1 to 14 of each astronaut)
Output: a function (imported by detect.py) returning mean and std per astronaut per signal.
"""

import os
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
# Override with CREW_CSV=path/to/file.csv to test on fake data.
CREW_CSV = Path(os.environ.get("CREW_CSV", ROOT / "data" / "processed" / "crew_daily.csv"))


# Cumulative_dose_msv is left out on purpose: It only ever rises, so it always looks "abnormal".
SIGNALS = [
    "resting_hr_bpm", "hrv_ms", "sleep_h", "spo2_pct", "systolic_bp_mmhg",
    "body_mass_kg", "exercise_min", "reaction_time_ms", "mood_1to5", "radiation_mgy"
]

BASELINE_LAST_DAY = 14
MIN_READINGS = 3
MIN_STD_FRACTION = 0.01
MIN_STD_ABS = {
    "mood_1to5": 0.5,
    "radiation_mgy": 0.01,
   "exercise_min" : 5.0,
   "spo2_pct": 0.5,
    "sleep_h": 0.2,
}

def compute_baselines(df: pd.DataFrame, last_day: int = BASELINE_LAST_DAY) -> dict:
    """Mean and spread per astronaut per signal, from mission days 1..last_day."""
    base_days = df[df["mission_day"] <= last_day] 
    baselines = {}
    for astronaut_id, group in base_days.groupby("astronaut_id"):
        baselines[astronaut_id] = {}
        for sig in SIGNALS:
            values = group[sig].dropna()
            if len(values) < MIN_READINGS:
                baselines[astronaut_id][sig] = {"mean": np.nan, "std": np.nan}
                continue
            mean = float(values.mean())
            std = float(values.std(ddof=1))
            floor = max(abs(mean) * MIN_STD_FRACTION, MIN_STD_ABS.get(sig, 1e-6))
            baselines[astronaut_id][sig] = {"mean": mean, "std": max(std, floor)}
    return baselines        