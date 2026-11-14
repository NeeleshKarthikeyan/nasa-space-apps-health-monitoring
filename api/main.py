"""API server. Owner: Fahim.

Endpoints (docs/data-contract.md, section 4):
  GET  /api/mission
  GET  /api/crew
  GET  /api/crew/{astronaut_id}/timeseries
  GET  /api/alerts?astronaut_id=
  POST /api/checkin          (optional, Hook 1)

TODO
1. Walking skeleton by 13:00: return hard-coded JSON matching the contract.
2. Then read from data/processed, model/output and explain/output.
3. Add CORS middleware for the dashboard URLs.
"""
