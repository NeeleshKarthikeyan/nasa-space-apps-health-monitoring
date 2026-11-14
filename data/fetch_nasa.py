"""Fetch real NASA data ONCE and save it. Owners: Jayden + Fahim.

Output: data/nasa_snapshots/<source>_<YYYY-MM-DD>.csv (or .json), untouched.

Why a snapshot: the live demo must never depend on a NASA site being up,
and judges can see exactly which real data we used.

Candidate sources (verify before relying on them):
- NASA OSDR RadLab: https://visualization.osdr.nasa.gov/radlab/
- NASA DONKI space weather via https://api.nasa.gov/ (put the key in .env, never commit it)

Record every source used in REFERENCES.md.
"""

if __name__ == "__main__":
    raise NotImplementedError("Download and save a snapshot: see the docstring above")
