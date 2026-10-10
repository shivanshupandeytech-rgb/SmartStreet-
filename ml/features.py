"""Shared feature definition so training and prediction never drift apart."""
import numpy as np

BASE_FEATURES = [
    "age_years", "previous_failures", "voltage", "operating_hours",
    "temperature", "rainfall", "maintenance_count", "days_since_maintenance",
]
FEATURES = BASE_FEATURES + ["voltage_dev"]


def add_engineered(df):
    df = df.copy()
    df["voltage_dev"] = (df["voltage"] - 230).abs()
    return df


def synthetic_risk(df):
    """Hidden 'ground truth' used ONLY to create synthetic labels (30-day failure chance)."""
    z = (
        -6.3
        + 0.30 * df["age_years"]
        + 0.55 * df["previous_failures"]
        + 0.09 * (df["voltage"] - 230).abs()
        + 0.12 * (df["operating_hours"] - 10)
        + 0.045 * (df["temperature"] - 30)
        + 0.04 * df["rainfall"]
        + 0.010 * df["days_since_maintenance"]
        - 0.20 * df["maintenance_count"]
    )
    return 1 / (1 + np.exp(-z))
