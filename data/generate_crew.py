"""
generate_crew.py  (Phase 1: rough version)

Creates simulated daily health data for 4 fictional astronauts over 60 mission days.
All values are SYNTHETIC. They are plausible for a simulation, not medical references.

Run from the repo root:  python data/generate_crew.py
Output:  data/raw/crew_daily_raw.csv
         data/processed/crew_daily.csv   (temporary, until validate.py exists)
"""

import os
import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)   # fixed seed: same data every run, for everyone
ASTRONAUTS = ['A', 'B', 'C', 'D']
DAYS = range(1, 61)

# Each astronaut's personal normal. Each one is slightly different on purpose,
# so the model must learn a personal baseline rather than one number for everyone.
NORMALS = {
    'A': {'resting_hr_bpm': 58, 'hrv_ms': 62, 'sleep_h': 7.2, 'spo2_pct': 98,
          'systolic_bp_mmhg': 115, 'body_mass_kg': 78, 'exercise_min': 120,
          'reaction_time_ms': 270, 'mood_1to5': 4},
    'B': {'resting_hr_bpm': 64, 'hrv_ms': 55, 'sleep_h': 7.5, 'spo2_pct': 97.5,
          'systolic_bp_mmhg': 120, 'body_mass_kg': 70, 'exercise_min': 100,
          'reaction_time_ms': 285, 'mood_1to5': 4},
    'C': {'resting_hr_bpm': 70, 'hrv_ms': 48, 'sleep_h': 6.8, 'spo2_pct': 98,
          'systolic_bp_mmhg': 122, 'body_mass_kg': 85, 'exercise_min': 90,
          'reaction_time_ms': 300, 'mood_1to5': 3},
    'D': {'resting_hr_bpm': 61, 'hrv_ms': 70, 'sleep_h': 7.0, 'spo2_pct': 98.5,
          'systolic_bp_mmhg': 112, 'body_mass_kg': 65, 'exercise_min': 135,
          'reaction_time_ms': 260, 'mood_1to5': 4},
}

# How much each signal wobbles from day to day (standard deviation)
NOISE = {'resting_hr_bpm': 2, 'hrv_ms': 4, 'sleep_h': 0.4, 'spo2_pct': 0.5,
         'systolic_bp_mmhg': 3, 'body_mass_kg': 0.2, 'exercise_min': 10,
         'reaction_time_ms': 12, 'mood_1to5': 0.4}

RADIATION_PER_DAY = 0.5  # placeholder: replace with a sourced value in Phase 2

rows = []
for a in ASTRONAUTS:
    for day in DAYS:
        row = {'astronaut_id': a, 'mission_day': day}
        for signal, normal in NORMALS[a].items():
            row[signal] = normal + rng.normal(0, NOISE[signal])
        row['radiation_mgy'] = RADIATION_PER_DAY + rng.normal(0, 0.05)
        row['scenario'] = 'normal'
        rows.append(row)

df = pd.DataFrame(rows)

# Make values physically sensible
df['mood_1to5'] = df['mood_1to5'].round().clip(1, 5).astype(int)
df['spo2_pct'] = df['spo2_pct'].clip(upper=100)
df['sleep_h'] = df['sleep_h'].clip(lower=0)
df['cumulative_dose_msv'] = df.groupby('astronaut_id')['radiation_mgy'].cumsum()

COLUMNS = ['astronaut_id', 'mission_day', 'resting_hr_bpm', 'hrv_ms', 'sleep_h', 'spo2_pct',
           'systolic_bp_mmhg', 'body_mass_kg', 'exercise_min', 'reaction_time_ms',
           'mood_1to5', 'radiation_mgy', 'cumulative_dose_msv', 'scenario']
df = df[COLUMNS].round(2)

os.makedirs('data/raw', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)

df.to_csv('data/raw/crew_daily_raw.csv', index=False)
df.to_csv('data/processed/crew_daily.csv', index=False)   # temporary, until validate.py exists
print('Saved', len(df), 'rows')