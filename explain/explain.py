"""Alert writer. Owner: E.S.

Input:  model/output/model_output.json + explain/hazard_map.csv
Output: explain/output/alerts.json (docs/data-contract.md, section 3)

TODO
1. For every non-green record, look up each top signal in hazard_map.csv.
2. Fill the explanation template with the real numbers (value vs baseline).
3. Collect actions and source URLs; apply the escalation rule.
"""

if __name__ == "__main__":
    raise NotImplementedError("Write the alert writer: see the TODO above")
