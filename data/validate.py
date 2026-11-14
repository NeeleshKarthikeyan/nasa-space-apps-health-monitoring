"""Validate simulator output against the contract. Owner: Jayden.

Input:  data/raw/crew_daily_raw.csv
Output: data/processed/crew_daily.csv

Fail loudly (raise an error with a clear message) if:
- a contract column is missing or has the wrong type
- an (astronaut_id, mission_day) pair is duplicated or a day is missing
- a value is physically impossible (e.g. spo2_pct > 100, sleep_h < 0)

Then handle gaps: fill short gaps from the previous day, leave long gaps empty
so the dashboard shows "no reading" instead of an invented value.
"""

if __name__ == "__main__":
    raise NotImplementedError("Write the checks: see the docstring above")
