"""Downloads real solar energetic particle (SEP) events from NASA DONKI.
Run from the repo root:  python data/fetch_nasa.py
Output: data/nasa_snapshots/donki_sep_2024-05.json
"""
import json
import os
import requests

key = os.environ.get('NASA_API_KEY', 'DEMO_KEY')
params = {'startDate': '2024-05-01', 'endDate': '2024-05-31', 'api_key': key}

r = requests.get('https://api.nasa.gov/DONKI/SEP', params=params, timeout=30)
r.raise_for_status()
events = r.json()

os.makedirs('data/nasa_snapshots', exist_ok=True)
with open('data/nasa_snapshots/donki_sep_2024-05.json', 'w') as f:
    json.dump(events, f, indent=2)

print(len(events), 'solar particle events saved')
for e in events:
    print(' ', e.get('eventTime'), e.get('sepID'))
if not events:
    print('0 events: widen startDate/endDate and run again')