"""Train the Random Forest failure model on the synthetic training set."""
import sys
from pathlib import Path
import joblib, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.model_selection import train_test_split
sys.path.insert(0, str(Path(__file__).parent))
from features import FEATURES, add_engineered

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "ml/saved_model/model.joblib"


def train():
    csv = ROOT / "ml/dataset/training_data.csv"
    if not csv.exists():
        from generate_data import main as gen
        gen()
    df = add_engineered(pd.read_csv(csv))
    X, y = df[FEATURES], df["failed_within_30d"]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=200, max_depth=8, min_samples_leaf=5,
                                   random_state=42, n_jobs=-1)
    model.fit(Xtr, ytr)
    proba = model.predict_proba(Xte)[:, 1]
    auc = roc_auc_score(yte, proba)
    print(f"ROC-AUC on held-out synthetic data: {auc:.3f}")
    print(classification_report(yte, model.predict(Xte), digits=3))
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "features": FEATURES, "auc": float(auc),
                 "importances": dict(zip(FEATURES, map(float, model.feature_importances_)))}, MODEL_PATH)
    print("Saved", MODEL_PATH)


if __name__ == "__main__":
    train()
