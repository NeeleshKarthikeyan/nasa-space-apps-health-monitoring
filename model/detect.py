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

if __name__ == "__main__":
    raise NotImplementedError("Write the detector: see the TODO above")
