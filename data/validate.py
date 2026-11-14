"""Validates the raw crew data and writes the processed file the rest of the team reads.
Run from the repo root:  python data/generate_crew.py  then  python data/validate.py
"""
import pandas as pd

COLUMNS = ['astronaut_id', 'mission_day', 'resting_hr_bpm', 'hrv_ms', 'sleep_h', 'spo2_pct',
           'systolic_bp_mmhg', 'body_mass_kg', 'exercise_min', 'reaction_time_ms',
           'mood_1to5', 'radiation_mgy', 'cumulative_dose_mgy', 'scenario']
GAP_COLS = ['resting_hr_bpm', 'hrv_ms', 'sleep_h', 'spo2_pct', 'systolic_bp_mmhg',
            'body_mass_kg', 'exercise_min', 'reaction_time_ms']

df = pd.read_csv('data/raw/crew_daily_raw.csv')

# Check 1: file shape
missing = set(COLUMNS) - set(df.columns)
assert not missing, f'Missing columns: {missing}'
assert not df.duplicated(['astronaut_id', 'mission_day']).any(), 'Duplicate astronaut/day rows'
assert (df.groupby('astronaut_id')['mission_day'].nunique() == 60).all(), 'An astronaut is missing days'

# Check 2: values are physically possible
assert not (df['spo2_pct'] > 100).any(), 'SpO2 above 100%'
assert not (df['sleep_h'] < 0).any(), 'Negative sleep'
assert df['mood_1to5'].between(1, 5).all(), 'Mood outside 1 to 5'

# Check 3: scenario labels are on the right astronaut and days
def labels(astronaut, start, end):
    m = (df['astronaut_id'] == astronaut) & df['mission_day'].between(start, end)
    return set(df.loc[m, 'scenario'])

assert labels('B', 44, 50) == {'fatigue_spe'}, 'B fatigue labels wrong'
assert labels('B', 46, 47) == {'fatigue_spe'}, 'B must keep fatigue_spe on solar days'
for a in ['A', 'C', 'D']:
    assert labels(a, 46, 47) == {'solar_event'}, f'{a} solar_event labels wrong'
assert labels('D', 30, 40) == {'cardio_drift'}, 'D cardio_drift labels wrong'
assert labels('A', 25, 25) == {'exercise_trap'}, 'A exercise_trap label wrong'
assert labels('C', 20, 45) == {'bone_muscle'}, 'C bone_muscle labels wrong'

# Check 4: demo rows have no sensor gaps
hero = df[((df['astronaut_id'] == 'B') & df['mission_day'].between(44, 50)) |
          ((df['astronaut_id'] == 'A') & (df['mission_day'] == 25))]
assert not hero[GAP_COLS].isna().any().any(), 'A sensor gap landed on a key demo row'

df[COLUMNS].to_csv('data/processed/crew_daily.csv', index=False)
print('OK:', len(df), 'rows written to data/processed/crew_daily.csv')