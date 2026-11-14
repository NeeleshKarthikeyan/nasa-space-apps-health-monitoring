"""Alert writer. Owner: E.S.

Input:  model/output/model_output.json + explain/hazard_map.csv
Output: explain/output/alerts.json (docs/data-contract.md, section 3)

TODO
1. For every non-green record, look up each top signal in hazard_map.csv.
2. Fill the explanation template with the real numbers (value vs baseline).
3. Collect actions and source URLs; apply the escalation rule.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL_FILE = ROOT/"model"/"output"/"model_output.json"
MAP_FILE = ROOT/"explain"/"hazard_map.csv"
ALERT_FILE = ROOT / "explain" / "output" / "alerts.json"

#need to confirm with Neelesh - prototype escalation rule
AMBER_DAYS_TO_ESCALATE = 2
ESCALATION_RULE = "red_immediate_amber_2_days"

SIGNALS = {
    "sleep_h": ("Sleep duration", "h"),
    "reaction_time_ms": ("Reaction time", "ms"),
    "mood_1to5": ("Mood score", "points"),
    "resting_hr_bpm": ("Resting heart rate", "bpm"),
    "hrv_ms": ("Heart-rate variability", "ms"),
    "systolic_bp_mmhg": ("Systolic blood pressure", "mmHg"),
    "body_mass_kg": ("Body mass", "kg"),
    "exercise_min": ("Exercise duration", "min"),
    "spo2_pct": ("Blood oxygen saturation", "%"),
    "radiation_mgy": ("Radiation dose", "mGy/day"),
}

def display_number(value):
    """Show numbers with up to two decimal places."""
    return f"{float(value):.2f}".rstrip("0").rstrip(".")

def load_mappings(path=MAP_FILE):
    """Read the NASA risk and action mapping."""
    with open(path, newline="", encoding="utf-8-sig") as file:
        rows = list(csv.DictReader(file))

    for row in rows:
        if row["escalate_rule"] != ESCALATION_RULE:
            raise ValueError(
                f"Unsupported escalation rule for {row['signal']}"
            )
        if not row["source_url"].startswith("https://"):
            raise ValueError(
                f"Missing source URL for {row['signal']}"
            )

    return {row["signal"]: row for row in rows}

def generate_alerts(records, mappings):
    """Convert model records into the frozen alert contract."""
    alerts = []
    previous = {}
    amber_streaks = {}

    # Sort per astronaut and mission day to detect persistence.
    ordered = sorted(
        records,
        key=lambda r: (
            str(r["astronaut_id"]),
            int(r["mission_day"])
        )
    )

    for record in ordered:
        astronaut = str(record["astronaut_id"])
        day = int(record["mission_day"])
        status = record["status"]

        if status not in {"green", "amber", "red"}:
            raise ValueError(f"Unknown status: {status}")

        prior_day, prior_status = previous.get(
            astronaut, (None, None)
        )

        # Count consecutive amber days for each astronaut.
        if status == "amber":
            if prior_day == day - 1 and prior_status == "amber":
                amber_streaks[astronaut] = (
                    amber_streaks.get(astronaut, 0) + 1
                )
            else:
                amber_streaks[astronaut] = 1
        else:
            amber_streaks[astronaut] = 0

        previous[astronaut] = (day, status)

        # The contract requires alerts only for non-green days.
        if status == "green":
            continue

        details = []
        actions = []
        sources = []
        top_signals = record.get("top_signals") or []

        for index, signal_record in enumerate(top_signals):
            signal = signal_record["signal"]

            if signal not in mappings or signal not in SIGNALS:
                raise ValueError(
                    f"No explanation mapping for signal: {signal}"
                )

            value = signal_record.get("value")
            baseline = signal_record.get("baseline")

            if value is None or baseline is None:
                continue

            label, unit = SIGNALS[signal]
            change = float(value) - float(baseline)

            if change > 0:
                direction = "above"
            elif change < 0:
                direction = "below"
            else:
                direction = "equal to"

            # Primary signal always gets attention.
            # Supporting signals with |z| < 1.5 are contextual.
            z = signal_record.get("z")
            notable = (
                index == 0
                or (z is not None and abs(float(z)) >= 1.5)
            )

            if index == 0:
                prefix = "Primary change"
            elif notable:
                prefix = "Additional notable change"
            else:
                prefix = "Other monitored reading"

            mapping = mappings[signal]

            description = mapping["explanation_template"].format(
                label=label,
                value=display_number(value),
                baseline=display_number(baseline),
                difference=display_number(abs(change)),
                direction=direction,
                unit=unit
            )

            if notable:
                description += (
                    f" Relevant NASA research risk: "
                    f"{mapping['nasa_risk']}."
                )

            details.append(f"{prefix}: {description}")

            if notable:
                actions.append(mapping["action"])

            sources.append(mapping["source_url"])

        # Handle missing comparison data safely.
        if not details:
            details.append(
                "An alert was reported without usable signal "
                "comparisons; verify the readings before interpretation."
            )
            actions.append(
                "Review the available measurements and onboard "
                "monitoring procedure."
            )
            sources.append("https://www.nasa.gov/hrp/risks/")

        # Apply team-defined escalation rules.
        escalate = (
            status == "red"
            or (
                status == "amber"
                and amber_streaks[astronaut]
                >= AMBER_DAYS_TO_ESCALATE
            )
        )

        if escalate:
            actions.insert(
                0,
                "Notify Earth using the mission's escalation procedure."
            )
        else:
            actions.append(
                "Continue onboard monitoring and review "
                "the next scheduled reading."
            )

        title_signal = (
            SIGNALS[top_signals[0]["signal"]][0]
            if top_signals
            else "Health measurement"
        )

        # Build a concise two-sentence dashboard explanation.
        valid_signals = [
            item for item in top_signals
            if item.get("signal") in SIGNALS
            and item.get("value") is not None
            and item.get("baseline") is not None
        ]

        if valid_signals:
            primary = valid_signals[0]
            signal = primary["signal"]
            label, unit = SIGNALS[signal]

            value = float(primary["value"])
            baseline = float(primary["baseline"])
            difference = value - baseline

            if difference > 0:
                direction = "above"
            elif difference < 0:
                direction = "below"
            else:
                direction = "equal to"

            explanation = (
                f"{label} is {display_number(value)} {unit}, "
                f"compared with a personal baseline of "
                f"{display_number(baseline)} {unit} "
                f"({display_number(abs(difference))} {unit} "
                f"{direction} baseline). "
            )

            if signal == "radiation_mgy":
                explanation += (
                    "This is a simulated radiation reading, "
                    "not a measured astronaut dose."
                )
            else:
                risk = mappings[signal]["nasa_risk"]
                explanation += (
                    f"Relevant NASA research risk: {risk}; "
                    "this simulated flag is not a diagnosis."
                )
        else:
            explanation = (
                "An anomaly was flagged, but usable comparison "
                "readings are unavailable; verify the data."
            )

        # Exact fields required by docs/data-contract.md section 3.
        alerts.append({
            "alert_id": f"{astronaut}-{day}",
            "astronaut_id": astronaut,
            "mission_day": day,
            "status": status,
            "title": (
                f"{status.capitalize()} alert: "
                f"{title_signal} change"
            ),
            "explanation": explanation,
            "actions": list(dict.fromkeys(actions)),
            "escalate_to_earth": escalate,
            "sources": list(dict.fromkeys(sources))
        })

    # Newest alerts first for the dashboard.
    return sorted(
        alerts,
        key=lambda a: (a["mission_day"], a["astronaut_id"]),
        reverse=True
    )

def main():
    with open(MODEL_FILE, encoding="utf-8") as file:
        records = json.load(file)

    mappings = load_mappings()
    alerts = generate_alerts(records, mappings)

    ALERT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(ALERT_FILE, "w", encoding="utf-8") as file:
        json.dump(alerts, file, indent=2, ensure_ascii=False)

    print(
        f"Wrote {len(alerts)} alerts to "
        f"{ALERT_FILE.relative_to(ROOT)}"
    )
    print(
        "Escalated to Earth: "
        f"{sum(a['escalate_to_earth'] for a in alerts)}"
    )

if __name__ == "__main__":
    main()

