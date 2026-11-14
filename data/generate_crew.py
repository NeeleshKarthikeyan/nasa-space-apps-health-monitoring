"""Crew simulator. Owner: Jayden.

Output: data/raw/crew_daily_raw.csv (columns exactly as docs/data-contract.md, section 1)

TODO
1. Fix the seed (np.random.default_rng(2026)) so results are repeatable.
2. Give each astronaut their own normal value per signal, then add daily noise.
3. Plant the scenarios listed in data/README.md and fill the `scenario` column.
4. Optionally drive radiation_mgy from data/nasa_snapshots/ (see fetch_nasa.py).
5. Leave a few realistic gaps (empty cells) to mimic sensor dropouts.
"""

if __name__ == "__main__":
    raise NotImplementedError("Write the simulator: see the TODO above")
