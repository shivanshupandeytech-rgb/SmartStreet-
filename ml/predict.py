"""Load the trained model and score streetlights. Trains automatically if no model exists."""
import sys
from pathlib import Path
import joblib, pandas as pd
sys.path.insert(0, str(Path(__file__).parent))
from features import FEATURES, add_engineered
from train_model import MODEL_PATH, train

_bundle = None


def get_bundle():
    global _bundle
    if _bundle is None:
        if not MODEL_PATH.exists():
            train()
        _bundle = joblib.load(MODEL_PATH)
    return _bundle


def predict_probabilities(records):
    """records: list of dicts with the base feature keys -> list of failure probabilities (0-1)."""
    if not records:
        return []
    b = get_bundle()
    df = add_engineered(pd.DataFrame(records))
    return [float(p) for p in b["model"].predict_proba(df[b["features"]])[:, 1]]


if __name__ == "__main__":
    print(predict_probabilities([{"age_years": 9, "previous_failures": 3, "voltage": 205,
        "operating_hours": 12, "temperature": 40, "rainfall": 12,
        "maintenance_count": 0, "days_since_maintenance": 300}]))
