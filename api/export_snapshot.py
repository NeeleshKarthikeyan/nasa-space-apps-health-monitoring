"""Fallback export. Owner: Fahim.

Calls each GET endpoint's function and saves the response to web/src/fallback/:
  mission.json, crew.json, timeseries_<ID>.json (one per astronaut), alerts.json

The dashboard shows these if the live API does not answer within 5 seconds,
so the demo never shows a spinner. Re-run after every pipeline change.
"""

if __name__ == "__main__":
    raise NotImplementedError("Write the export: see the docstring above")
