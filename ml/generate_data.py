"""Generates SYNTHETIC data: a training set and a demo fleet of streetlights around Indore.
None of this is real municipal data."""
import json, sys
from pathlib import Path
import numpy as np, pandas as pd
sys.path.insert(0, str(Path(__file__).parent))
from features import BASE_FEATURES, synthetic_risk

ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(42)

# Approximate neighbourhood centres (demo only)
AREAS = [
    ("Vijay Nagar", 22.7533, 75.8937), ("Palasia", 22.7240, 75.8830),
    ("Rajwada", 22.7185, 75.8553), ("Bhawarkuan", 22.6938, 75.8690),
    ("Saket Nagar", 22.7064, 75.8920), ("Sudama Nagar", 22.6940, 75.8480),
    ("Annapurna", 22.6920, 75.8290), ("Rau", 22.6430, 75.8040),
]


def sample_features(n):
    return pd.DataFrame({
        "age_years": rng.gamma(3.0, 1.6, n).clip(0.2, 14).round(1),
        "previous_failures": rng.poisson(1.0, n).clip(0, 6),
        "voltage": rng.normal(228, 9, n).clip(195, 255).round(0),
        "operating_hours": rng.normal(10.5, 1.4, n).clip(6, 14).round(1),
        "temperature": rng.normal(31, 6, n).clip(12, 46).round(0),
        "rainfall": rng.exponential(4, n).clip(0, 40).round(0),
        "maintenance_count": rng.poisson(2.0, n).clip(0, 8),
        "days_since_maintenance": rng.integers(5, 420, n),
    })


def main():
    # 1) training set
    train = sample_features(4000)
    train["failed_within_30d"] = (rng.random(len(train)) < synthetic_risk(train)).astype(int)
    (ROOT / "ml/dataset").mkdir(parents=True, exist_ok=True)
    train.to_csv(ROOT / "ml/dataset/training_data.csv", index=False)

    # 2) demo fleet
    n = 220
    fleet = sample_features(n)
    hidden = synthetic_risk(fleet).values
    rows = []
    for i, r in fleet.iterrows():
        name, lat, lon = AREAS[i % len(AREAS)]
        failed = rng.random() < min(0.45, hidden[i] * 0.6)
        d = {k: (float(v) if isinstance(v, (np.floating,)) else int(v) if isinstance(v, (np.integer,)) else v)
             for k, v in r.items()}
        d.update({
            "id": f"SL-{i + 1:03d}",
            "latitude": round(lat + rng.normal(0, 0.006), 6),
            "longitude": round(lon + rng.normal(0, 0.006), 6),
            "location": f"{name}, Indore",
            "status": "failed" if failed else "working",
            "last_inspection": f"2026-{int(rng.integers(7, 11)):02d}-{int(rng.integers(1, 28)):02d}",
            "data_source": "synthetic",
        })
        rows.append(d)
    out = ROOT / "backend/data/streetlights.json"
    out.write_text(json.dumps(rows, indent=2))
    print(f"Wrote {len(train)} training rows and {len(rows)} demo streetlights (SYNTHETIC).")


if __name__ == "__main__":
    main()
