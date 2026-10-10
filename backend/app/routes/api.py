from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from app.models.schemas import WhatIf
from app.services import scoring, vision, iot_simulator

router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"ok": True}


@router.get("/stats")
def get_stats():
    return scoring.stats()


@router.get("/streetlights")
def list_lights(risk: str | None = Query(None), q: str | None = None):
    rows = scoring.enrich()
    if risk:
        rows = [r for r in rows if r["risk_level"] == risk.upper()]
    if q:
        rows = [r for r in rows if q.lower() in (r["id"] + r["location"]).lower()]
    return rows


@router.get("/streetlights/{light_id}")
def one_light(light_id: str):
    for r in scoring.enrich():
        if r["id"] == light_id:
            return r
    raise HTTPException(404, "Streetlight not found")


@router.get("/predictions")
def predictions(limit: int = 25):
    rows = [r for r in scoring.enrich() if r["status"] == "working"]
    return sorted(rows, key=lambda r: -r["failure_probability"])[:limit]


@router.post("/predictions/what-if")
def what_if(body: WhatIf):
    return scoring.what_if(body.model_dump())


@router.get("/maintenance")
def maintenance_queue():
    rows = [r for r in scoring.enrich() if r["risk_level"] in ("FAILED", "HIGH", "MEDIUM")]
    return sorted(rows, key=lambda r: -r["priority_score"])


@router.post("/maintenance/{light_id}/complete")
def complete(light_id: str):
    res = scoring.mark_serviced(light_id)
    if not res:
        raise HTTPException(404, "Streetlight not found")
    return res


@router.get("/analytics")
def get_analytics():
    return scoring.analytics()


@router.post("/vision/analyze")
async def analyze_image(file: UploadFile = File(...)):
    return vision.analyze(await file.read())


@router.get("/iot/readings")
def iot_readings():
    """Return the latest synthetic IoT sensor snapshot for the demo dashboard."""
    return iot_simulator.get_snapshot()


@router.get("/iot/summary")
def iot_summary():
    """Summarize the latest synthetic IoT sensor snapshot."""
    return iot_simulator.summary()


@router.post("/iot/simulate/tick")
def iot_simulate_tick():
    """Advance the simulator and generate a fresh synthetic sensor snapshot."""
    snapshot = iot_simulator.get_snapshot(refresh=True)
    return {**snapshot, "summary": iot_simulator.summary()}
