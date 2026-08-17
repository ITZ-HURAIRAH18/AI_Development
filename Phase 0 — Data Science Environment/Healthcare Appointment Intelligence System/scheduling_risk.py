def calculate_scheduling_risk(
    no_show_probability,
    waiting_time,
    doctor_load,
    queue_length,
    room_available
):

    score = 0

    # No-show risk
    if no_show_probability >= 0.7:
        score += 3
    elif no_show_probability >= 0.4:
        score += 2
    else:
        score += 1

    # Waiting time risk
    if waiting_time >= 45:
        score += 3
    elif waiting_time >= 20:
        score += 2
    else:
        score += 1

    # Doctor load
    if doctor_load >= 0.8:
        score += 3
    elif doctor_load >= 0.5:
        score += 2
    else:
        score += 1

    # Queue
    if queue_length >= 8:
        score += 3
    elif queue_length >= 4:
        score += 2
    else:
        score += 1

    # Room availability
    if room_available == 0:
        score += 2

    # Final risk
    if score >= 10:
        risk = "HIGH"
    elif score >= 6:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return risk, score


# Example
risk, score = calculate_scheduling_risk(
    no_show_probability=0.72,
    waiting_time=38,
    doctor_load=0.91,
    queue_length=9,
    room_available=0
)

print("Scheduling Risk:", risk)
print("Risk Score:", score)