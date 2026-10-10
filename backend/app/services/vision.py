"""Optional CV module: classifies a streetlight photo as lit / unlit using bright-blob detection (OpenCV).
A lightweight heuristic, not a trained detector. YOLO can replace it later without touching the API."""
import numpy as np

try:
    import cv2
except Exception:  # keeps the main app alive if OpenCV is missing
    cv2 = None


def analyze(image_bytes: bytes):
    if cv2 is None:
        return {"available": False, "message": "OpenCV is not installed."}
    img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        return {"available": True, "error": "Could not read this file as an image."}
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bright = cv2.threshold(gray, 235, 255, cv2.THRESH_BINARY)
    bright = cv2.morphologyEx(bright, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    _, _, stats, _ = cv2.connectedComponentsWithStats(bright)
    blobs = [s[cv2.CC_STAT_AREA] for s in stats[1:] if s[cv2.CC_STAT_AREA] >= 25]
    frac = float((gray > 235).mean())
    lit = len(blobs) > 0 and frac > 0.0005
    return {"available": True, "lamp_state": "lit" if lit else "unlit",
            "bright_regions": len(blobs), "bright_fraction": round(frac, 5),
            "confidence": round(min(0.95, 0.55 + min(frac * 40, 0.4)) if lit else 0.6, 2),
            "note": "Heuristic brightness check. Use night-time photos taken from below the lamp."}
