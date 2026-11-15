
import unittest

from explain.explain import generate_alerts, load_mappings


class TestExplainability(unittest.TestCase):

    def setUp(self):
        self.mappings = load_mappings()

    def record(self, day, status):
        return {
            "astronaut_id": "TEST",
            "mission_day": day,
            "status": status,
            "top_signals": [
                {
                    "signal": "sleep_h",
                    "value": 5.4,
                    "baseline": 7.1,
                    "z": -2.6
                }
            ]
        }

    def test_green_generates_no_alert(self):
        alerts = generate_alerts(
            [self.record(1, "green")],
            self.mappings
        )
        self.assertEqual(len(alerts), 0)

    def test_single_amber_does_not_escalate(self):
        alerts = generate_alerts(
            [self.record(1, "amber")],
            self.mappings
        )
        self.assertFalse(alerts[0]["escalate_to_earth"])

    def test_two_consecutive_ambers_escalate(self):
        records = [
            self.record(46, "amber"),
            self.record(47, "amber")
        ]

        alerts = generate_alerts(records, self.mappings)
        by_day = {a["mission_day"]: a for a in alerts}

        self.assertFalse(by_day[46]["escalate_to_earth"])
        self.assertTrue(by_day[47]["escalate_to_earth"])

    def test_red_escalates_immediately(self):
        alerts = generate_alerts(
            [self.record(1, "red")],
            self.mappings
        )
        self.assertTrue(alerts[0]["escalate_to_earth"])

    def test_gap_resets_amber_streak(self):
        records = [
            self.record(1, "amber"),
            self.record(2, "amber"),
            self.record(4, "amber"),
            self.record(5, "amber")
        ]

        alerts = generate_alerts(records, self.mappings)
        by_day = {a["mission_day"]: a for a in alerts}

        # First amber day: no escalation
        self.assertFalse(by_day[1]["escalate_to_earth"])

        # Second consecutive amber day: escalation
        self.assertTrue(by_day[2]["escalate_to_earth"])

        # Day 3 is missing, so Day 4 starts a new streak
        self.assertFalse(by_day[4]["escalate_to_earth"])

        # Day 5 is the second consecutive amber day
        self.assertTrue(by_day[5]["escalate_to_earth"])



if __name__ == "__main__":
    unittest.main()
