"""Simulated Flood Hub-style gauge feed.

Google Flood Hub publishes river-gauge forecasts, but there is no open,
self-serve API an individual developer can call directly for arbitrary rivers.
Baadh Mitra's actual contribution starts *after* an alert exists (turning a
forecast into a prioritised, offline-friendly door-to-door checklist) so this
module stands in for that upstream feed with a small, honest, clearly-labelled
simulator. Swapping this module for a real integration is the natural next
step, documented in the README.
"""

import random
from datetime import datetime

from app.models import Severity

_SEVERITY_LADDER = [
    (Severity.watch, (1.5, 2.5), "River rising slowly. Monitor, no action needed yet."),
    (Severity.moderate, (2.5, 3.5), "River level approaching bankfull. Prepare warning routes."),
    (Severity.severe, (3.5, 4.8), "Bankfull expected within 24-48 hours. Begin door-to-door relay."),
    (Severity.extreme, (4.8, 6.0), "Major flooding expected imminently. Evacuate priority households now."),
]


def generate_next_alert(river: str, previous_severity: Severity | None = None) -> dict:
    """Produce the next plausible alert for a river, nudging severity up or
    down from wherever it last was rather than jumping randomly, the same way
    a real flood forecast evolves step by step."""

    levels = [s for s, _, _ in _SEVERITY_LADDER]
    if previous_severity is None:
        idx = 0
    else:
        prev_idx = levels.index(previous_severity)
        # 60% chance of escalating, 40% chance of holding/receding, biased
        # toward escalation so a demo naturally shows the checklist mattering.
        move = random.choices([1, 0, -1], weights=[0.6, 0.25, 0.15])[0]
        idx = max(0, min(len(levels) - 1, prev_idx + move))

    severity, (lo, hi), note = _SEVERITY_LADDER[idx]
    river_level_m = round(random.uniform(lo, hi), 2)

    return {
        "severity": severity,
        "river_level_m": river_level_m,
        "forecast_note": f"{river}: {note}",
        "issued_at": datetime.utcnow(),
        "source": "simulated_flood_feed",
    }
