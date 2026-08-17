import logging
from pathlib import Path
from typing import List

import joblib
import pandas as pd

from app.core.config import get_settings

logger = logging.getLogger("healthcare-intelligence")

settings = get_settings()

_APP_DIR = Path(__file__).resolve().parent.parent


class MLService:
    """Loads the existing trained models once and reuses them across requests."""

    def __init__(self) -> None:
        self._no_show_model = None
        self._waiting_time_model = None

    # ------------------------------------------------------------------
    # Model paths
    # ------------------------------------------------------------------

    def _resolve_model_path(self, configured: str) -> Path:
        path = Path(configured)
        if path.is_absolute():
            return path
        return _APP_DIR / path

    # ------------------------------------------------------------------
    # Loading
    # ------------------------------------------------------------------

    def load_models(self) -> None:
        no_show_path = self._resolve_model_path(settings.no_show_model_path)
        waiting_time_path = self._resolve_model_path(settings.waiting_time_model_path)

        if not no_show_path.exists():
            raise FileNotFoundError(
                f"No-show model not found at {no_show_path}. "
                "Place no_show_model.pkl in backend/app/ml/."
            )
        if not waiting_time_path.exists():
            raise FileNotFoundError(
                f"Waiting-time model not found at {waiting_time_path}. "
                "Place waiting_time_model.pkl in backend/app/ml/."
            )

        logger.info("Loading no-show model from %s", no_show_path)
        self._no_show_model = joblib.load(no_show_path)

        logger.info("Loading waiting-time model from %s", waiting_time_path)
        self._waiting_time_model = joblib.load(waiting_time_path)

        logger.info(
            "ML models loaded: no-show (%d features), waiting-time (%d features)",
            getattr(self._no_show_model, "n_features_in_", 0),
            getattr(self._waiting_time_model, "n_features_in_", 0),
        )

    def get_no_show_model(self):
        if self._no_show_model is None:
            self.load_models()
        return self._no_show_model

    def get_waiting_time_model(self):
        if self._waiting_time_model is None:
            self.load_models()
        return self._waiting_time_model

    # ------------------------------------------------------------------
    # Prediction helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _to_frame(values: list[float], column_names: List[str]) -> pd.DataFrame:
        return pd.DataFrame([values], columns=column_names)

    def predict_no_show(self, features: list[float], column_names: List[str]) -> float:
        model = self.get_no_show_model()
        frame = self._to_frame(features, column_names)
        probability = model.predict_proba(frame)[0][1]
        return round(float(probability), 4)

    def predict_waiting_time(self, features: list[float], column_names: List[str]) -> float:
        model = self.get_waiting_time_model()
        frame = self._to_frame(features, column_names)
        value = float(model.predict(frame)[0])
        return round(value, 2)


ml_service = MLService()
