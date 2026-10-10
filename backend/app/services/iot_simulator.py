"""In-memory simulated IoT telemetry for SmartStreet demonstrations.

All readings produced here are synthetic. This module is deliberately separate
from the streetlight source records and does not overwrite maintenance data.
"""
from datetime import datetime, timezone
import random
import threading

from app.services import scoring

_lock = threading.Lock()
_latest = None
_tick = 0


def _clamp(value, low, high):
    return round(max(low, min(high, value)), 2)


def _make_readings():
    global _tick
    _tick += 1
    rng = random.Random(20261009 + _tick)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    rows = []
    for light in scoring.enrich():
        failed = light["status"] == "failed"
        # Simulate a small number of intermittent faults among working lights,
        # weighted toward high-risk fixtures. These are demo events, not real alerts.
        intermittent_fault = (not failed and light["failure_probability"] >= 0.5 and rng.random() < 0.12)
        fault = failed or intermittent_fault
        voltage = _clamp(light["voltage"] + rng.uniform(-2.5, 2.5), 180, 255)
        current = 0.0 if fault else _clamp(rng.uniform(0.22, 0.48), 0.05, 1.0)
        lamp_lux = _clamp(rng.uniform(0.0, 4.0) if fault else rng.uniform(35, 90), 0, 120)
        temperature = _clamp(light["temperature"] + rng.uniform(-1.8, 1.8), -10, 80)
        detected = current < 0.05 or lamp_lux < 10
        rows.append({
            "device_id": f"IOT-{light['id']}",
            "streetlight_id": light["id"],
            "location": light["location"],
            "latitude": light["latitude"],
            "longitude": light["longitude"],
            "voltage_v": voltage,
            "current_a": current,
            "lamp_lux": lamp_lux,
            "temperature_c": temperature,
            "commanded_on": True,
            "lamp_detected_on": not detected,
            "sensor_status": "FAULT" if detected else "NORMAL",
            "source_status": light["status"],
            "failure_probability": light["failure_probability"],
            "risk_level": light["risk_level"],
            "alert": "No current/light output detected" if detected else None,
            "timestamp": now,
            "data_source": "simulated",
        })
    return {"tick": _tick, "generated_at": now, "data_source": "simulated", "readings": rows}


def get_snapshot(refresh=False):
    global _latest
    with _lock:
        if refresh or _latest is None:
            _latest = _make_readings()
        # Return a copy so callers cannot mutate the cached snapshot.
        return {**_latest, "readings": [dict(row) for row in _latest["readings"]]}


def summary():
    snapshot = get_snapshot()
    readings = snapshot["readings"]
    faults = [row for row in readings if row["sensor_status"] == "FAULT"]
    return {
        "device_count": len(readings),
        "online_devices": len(readings),
        "faults_detected": len(faults),
        "normal_devices": len(readings) - len(faults),
        "tick": snapshot["tick"],
        "generated_at": snapshot["generated_at"],
        "data_source": "simulated",
    }
