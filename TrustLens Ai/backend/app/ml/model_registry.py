import json
from pathlib import Path

import joblib
from xgboost import XGBClassifier, XGBRegressor
from sklearn.ensemble import IsolationForest

from app.ml.feature_store import FEATURE_COLUMNS
from app.utils.config import get_settings


class ModelRegistry:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.model_dir = Path(settings.model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

    def load_or_build(self) -> dict:
        pd_model = self._load_or_default(self.settings.pd_model_path, self._default_pd_model())
        lgd_model = self._load_or_default(self.settings.lgd_model_path, self._default_lgd_model())
        fraud_model = self._load_or_default(self.settings.fraud_model_path, self._default_fraud_model())
        insurance_model = self._load_or_default(self.settings.insurance_model_path, self._default_insurance_model())

        if not Path(self.settings.feature_columns_path).exists():
            with open(self.settings.feature_columns_path, "w", encoding="utf-8") as fh:
                json.dump(FEATURE_COLUMNS, fh)

        return {
            "pd": pd_model,
            "lgd": lgd_model,
            "fraud": fraud_model,
            "insurance": insurance_model,
            "features": FEATURE_COLUMNS,
        }

    @staticmethod
    def _load_or_default(path: str, fallback_model):
        p = Path(path)
        if p.exists():
            return joblib.load(p)
        return fallback_model

    @staticmethod
    def _default_pd_model() -> XGBClassifier:
        model = XGBClassifier(n_estimators=10, max_depth=3, learning_rate=0.1, eval_metric="logloss")
        return model

    @staticmethod
    def _default_lgd_model() -> XGBRegressor:
        model = XGBRegressor(n_estimators=10, max_depth=3, learning_rate=0.1)
        return model

    @staticmethod
    def _default_fraud_model() -> IsolationForest:
        return IsolationForest(n_estimators=50, contamination=0.08, random_state=42)

    @staticmethod
    def _default_insurance_model() -> XGBClassifier:
        model = XGBClassifier(n_estimators=10, max_depth=3, learning_rate=0.1, eval_metric="logloss")
        return model
