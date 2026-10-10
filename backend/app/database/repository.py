"""JSON-file repository. Swap this class for a MongoDB one later; routes only use these methods."""
import json, threading
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "streetlights.json"
_lock = threading.Lock()


class StreetlightRepository:
    def __init__(self, path=DATA_FILE):
        self.path = path

    def all(self):
        with _lock:
            return json.loads(self.path.read_text())

    def save_all(self, rows):
        with _lock:
            self.path.write_text(json.dumps(rows, indent=2))


repo = StreetlightRepository()
