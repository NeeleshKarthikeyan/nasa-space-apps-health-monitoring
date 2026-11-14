#!/usr/bin/env bash
# Runs the whole data pipeline in order. Stop at the first error.
# Output of each step is the input of the next (see docs/data-contract.md).
set -e

echo "1/5 Generate crew data"          && python data/generate_crew.py
echo "2/5 Validate crew data"          && python data/validate.py
echo "3/5 Detect anomalies"            && python model/detect.py
echo "4/5 Write alerts"                && python explain/explain.py
echo "5/5 Export dashboard fallback"   && python api/export_snapshot.py

echo "Done. Commit data/processed, model/output, explain/output and web/src/fallback."
