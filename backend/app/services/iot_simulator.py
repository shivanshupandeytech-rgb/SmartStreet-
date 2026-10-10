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

_active_alerts = {}
_scenario = "normal"
_manual_fault_target = None
_simulation_active = False

THRESHOLDS = {
    "voltage_min": 190.0,
    "voltage_max": 250.0,
    "current_min": 0.05,
    "current_max": 0.9,
    "lamp_lux_min": 10.0,
    "temperature_max": 65.0
}

def set_simulation_state(active: bool):
    global _simulation_active
    with _lock:
        _simulation_active = active
        return _simulation_active

def set_scenario(scenario: str, target: str = None):
    global _scenario, _manual_fault_target
    with _lock:
        _scenario = scenario
        _manual_fault_target = target
        return _scenario

def get_alerts():
    with _lock:
        return list(_active_alerts.values())

def _clamp(value, low, high):
    return round(max(low, min(high, value)), 2)

def _make_readings():
    global _tick, _active_alerts
    _tick += 1
    rng = random.Random(20261009 + _tick)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    rows = []
    
    current_alerts = {}

    for light in scoring.enrich():
        failed = light["status"] == "failed"
        
        # Apply scenario
        scenario = "normal"
        if _scenario != "normal":
            if _manual_fault_target:
                if light["id"] == _manual_fault_target:
                    scenario = _scenario
            else:
                if rng.random() < 0.05:
                    scenario = _scenario
        
        fault = failed
        if scenario in ["lamp_failure"]:
            fault = True
            
        voltage = _clamp(light["voltage"] + rng.uniform(-2.5, 2.5), 180, 255)
        current = 0.0 if fault else _clamp(rng.uniform(0.22, 0.48), 0.05, 1.0)
        lamp_lux = _clamp(rng.uniform(0.0, 4.0) if fault else rng.uniform(35, 90), 0, 120)
        temperature = _clamp(light["temperature"] + rng.uniform(-1.8, 1.8), -10, 80)
        
        if scenario == "abnormal_voltage":
            voltage = rng.choice([rng.uniform(160, 185), rng.uniform(255, 280)])
        elif scenario == "abnormal_current":
            current = rng.uniform(1.1, 2.0)
        elif scenario == "low_brightness" and not fault:
            lamp_lux = rng.uniform(2, 9)
        elif scenario == "overheating":
            temperature = rng.uniform(66, 95)
            
        voltage = round(voltage, 2)
        current = round(current, 2)
        lamp_lux = round(lamp_lux, 2)
        temperature = round(temperature, 2)

        # Fault detection
        fault_type = None
        severity = None
        reading_val = None
        threshold_val = None

        if lamp_lux < THRESHOLDS["lamp_lux_min"]:
            fault_type = "Lamp Failure/Low Output"
            severity = "CRITICAL"
            reading_val = lamp_lux
            threshold_val = THRESHOLDS["lamp_lux_min"]
        elif current < THRESHOLDS["current_min"]:
            fault_type = "No Current"
            severity = "CRITICAL"
            reading_val = current
            threshold_val = THRESHOLDS["current_min"]
        elif current > THRESHOLDS["current_max"]:
            fault_type = "Overcurrent"
            severity = "HIGH"
            reading_val = current
            threshold_val = THRESHOLDS["current_max"]
        elif voltage < THRESHOLDS["voltage_min"] or voltage > THRESHOLDS["voltage_max"]:
            fault_type = "Abnormal Voltage"
            severity = "MEDIUM"
            reading_val = voltage
            threshold_val = f"{THRESHOLDS['voltage_min']}-{THRESHOLDS['voltage_max']}"
        elif temperature > THRESHOLDS["temperature_max"]:
            fault_type = "Overheating"
            severity = "HIGH"
            reading_val = temperature
            threshold_val = THRESHOLDS["temperature_max"]
            
        detected = fault_type is not None

        if detected:
            alert = {
                "id": f"ALT-{light['id']}-{_tick}",
                "streetlight_id": light["id"],
                "location": light["location"],
                "fault_type": fault_type,
                "severity": severity,
                "reading": reading_val,
                "threshold": threshold_val,
                "timestamp": now,
            }
            if light["id"] in _active_alerts:
                # keep old timestamp but update reading
                old_alert = _active_alerts[light["id"]]
                if old_alert["fault_type"] == fault_type:
                    alert["timestamp"] = old_alert["timestamp"]
            current_alerts[light["id"]] = alert

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
            "alert": fault_type if detected else None,
            "timestamp": now,
            "data_source": "simulated",
        })
        
    _active_alerts = current_alerts
    return {"tick": _tick, "generated_at": now, "data_source": "simulated", "readings": rows, "scenario": _scenario, "active": _simulation_active}


def get_snapshot(refresh=False):
    global _latest
    with _lock:
        if refresh or _latest is None:
            _latest = _make_readings()
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
        "scenario": _scenario,
        "active": _simulation_active,
        "alerts_count": len(get_alerts())
    }
