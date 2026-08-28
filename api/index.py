import sys
from pathlib import Path

_backend_dir = (
    Path(__file__).resolve().parent.parent
    / "Phase 0 — Data Science Environment"
    / "Healthcare Appointment Intelligence System"
    / "backend"
)
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from app.main import app  # noqa: E402
