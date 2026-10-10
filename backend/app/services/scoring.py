"""Business logic: scoring, risk levels, priority, stats. Routes stay thin."""
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "ml"))
from predict import predict_probabilities, get_bundle  # noqa: E402
from app.database.repository import repo  # noqa: E402

MEDIUM, HIGH = 0.25, 0.50


def risk_level(p):
    return "HIGH" if p >= HIGH else "MEDIUM" if p >= MEDIUM else "LOW"


def reason_for(r):
    """Plain-language drivers shown to operators (rule-based, from the lamp's own readings)."""
    out = []
    if r["age_years"] >= 7: out.append(f"Old fixture ({r['age_years']} yrs)")
    if r["previous_failures"] >= 2: out.append(f"{r['previous_failures']} past failures")
    if abs(r["voltage"] - 230) >= 15: out.append(f"Unstable voltage ({int(r['voltage'])} V)")
    if r["days_since_maintenance"] >= 240: out.append(f"{r['days_since_maintenance']} days since service")
    if r["operating_hours"] >= 12: out.append("Long nightly run time")
    if r["rainfall"] >= 15: out.append("Heavy rainfall exposure")
    if r["temperature"] >= 38: out.append("High temperature")
    return out or ["No single dominant factor"]


def enrich():
    rows = repo.all()
    probs = predict_probabilities(rows)
    out = []
    for r, p in zip(rows, probs):
        r = dict(r)
        failed = r["status"] == "failed"
        p = 1.0 if failed else p
        r["failure_probability"] = round(p, 3)
        r["risk_level"] = "FAILED" if failed else risk_level(p)
        # failed lights outrank everything; among them, longer-unserviced first
        r["priority_score"] = round(100 + min(r["days_since_maintenance"], 400) / 40, 1) if failed else round(100 * p, 1)
        r["reasons"] = ["Reported failed - needs repair"] if failed else reason_for(r)
        out.append(r)
    return out


def stats(rows=None):
    rows = rows or enrich()
    failed = [r for r in rows if r["status"] == "failed"]
    risky = [r for r in rows if r["risk_level"] in ("MEDIUM", "HIGH")]
    working = [r for r in rows if r["risk_level"] == "LOW"]
    high = [r for r in rows if r["risk_level"] in ("HIGH", "FAILED")]
    n = len(rows) or 1
    return {
        "total": len(rows), "working": len(working), "at_risk": len(risky),
        "failed": len(failed), "high_priority": len(high),
        "efficiency": round(100 * (len(rows) - len(failed)) / n, 1),
        "model_auc": round(get_bundle()["auc"], 3),
        "data_source": "synthetic",
    }


def analytics(rows=None):
    rows = rows or enrich()
    by_area = {}
    for r in rows:
        a = r["location"].split(",")[0]
        d = by_area.setdefault(a, {"area": a, "LOW": 0, "MEDIUM": 0, "HIGH": 0, "FAILED": 0})
        d[r["risk_level"]] += 1
    buckets = {}
    for r in rows:
        lo = int(r["age_years"] // 2) * 2
        d = buckets.setdefault(lo, {"age": f"{lo}-{lo + 2}", "n": 0, "sum": 0.0})
        d["n"] += 1; d["sum"] += r["failure_probability"]
    age = [{"age": v["age"], "avg_risk": round(v["sum"] / v["n"], 3)} for _, v in sorted(buckets.items())]
    imp = sorted(({"feature": k, "importance": round(v, 3)} for k, v in get_bundle()["importances"].items()),
                 key=lambda x: -x["importance"])
    return {"by_area": sorted(by_area.values(), key=lambda x: x["area"]), "risk_by_age": age, "feature_importance": imp}


def mark_serviced(light_id):
    rows = repo.all()
    for r in rows:
        if r["id"] == light_id:
            r.update(status="working", days_since_maintenance=0,
                     maintenance_count=r["maintenance_count"] + 1,
                     voltage=230.0, last_inspection=date.today().isoformat())
            repo.save_all(rows)
            return next(x for x in enrich() if x["id"] == light_id)
    return None


def what_if(payload: dict):
    p = predict_probabilities([payload])[0]
    return {"failure_probability": round(p, 3), "risk_level": risk_level(p), "reasons": reason_for(payload)}
