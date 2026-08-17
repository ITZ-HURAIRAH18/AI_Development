from typing import List, Tuple


def calculate_scheduling_risk(
    no_show_probability: float,
    waiting_time: float,
    doctor_load: float,
    queue_length: int,
    room_available: int,
) -> Tuple[str, int, List[str]]:
    """Calculate scheduling risk using the existing risk logic.

    Returns a tuple of (risk_level, risk_score, risk_factors).
    """
    score = 0
    factors: List[str] = []

    # No-show probability
    if no_show_probability >= 0.7:
        score += 3
        factors.append("High no-show probability")
    elif no_show_probability >= 0.4:
        score += 2
        factors.append("Elevated no-show probability")
    else:
        score += 1

    # Expected waiting time
    if waiting_time >= 45:
        score += 3
        factors.append("Long expected waiting time")
    elif waiting_time >= 20:
        score += 2
        factors.append("Elevated expected waiting time")
    else:
        score += 1

    # Doctor load
    if doctor_load >= 0.8:
        score += 3
        factors.append("High doctor workload")
    elif doctor_load >= 0.5:
        score += 2
        factors.append("Elevated doctor workload")
    else:
        score += 1

    # Queue length
    if queue_length >= 8:
        score += 3
        factors.append("Long queue")
    elif queue_length >= 4:
        score += 2
        factors.append("Moderate queue")
    else:
        score += 1

    # Room availability
    if room_available == 0:
        score += 2
        factors.append("Room unavailable")

    # Final risk
    if score >= 10:
        risk = "HIGH"
    elif score >= 6:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return risk, score, factors
