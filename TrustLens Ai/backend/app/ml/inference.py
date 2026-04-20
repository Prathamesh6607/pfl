from dataclasses import dataclass
from typing import Dict, List

import numpy as np
import shap

from app.ml.feature_store import FEATURE_COLUMNS, FeatureStore
from app.schemas.loan import LoanApplicationRequest


@dataclass
class InferenceOutput:
    pd: float
    lgd: float
    fraud_score: float
    insurance_recommended: bool
    top_features: List[Dict]


class InferenceEngine:
    def __init__(self, models: Dict):
        self.models = models

    def predict(self, request: LoanApplicationRequest) -> InferenceOutput:
        frame = FeatureStore.to_frame(request)

        pd_score = self._predict_pd(frame)
        lgd_score = self._predict_lgd(frame)
        fraud_score = self._predict_fraud(frame)
        insurance_recommended = self._predict_insurance(frame)
        top_features = self._shap_explain_pd(frame)

        return InferenceOutput(
            pd=float(np.clip(pd_score, 0.01, 0.99)),
            lgd=float(np.clip(lgd_score, 0.05, 0.95)),
            fraud_score=float(np.clip(fraud_score, 0.0, 1.0)),
            insurance_recommended=insurance_recommended,
            top_features=top_features,
        )

    def _predict_pd(self, frame):
        model = self.models["pd"]
        if hasattr(model, "predict_proba"):
            try:
                return float(model.predict_proba(frame)[0][1])
            except Exception:
                return 0.25
        return 0.25

    def _predict_lgd(self, frame):
        model = self.models["lgd"]
        try:
            return float(model.predict(frame)[0])
        except Exception:
            return 0.35

    def _predict_fraud(self, frame):
        model = self.models["fraud"]
        try:
            decision = float(model.decision_function(frame)[0])
            # decision_function > 0 generally means inlier (safer), < 0 means outlier (riskier).
            calibrated = 1 / (1 + np.exp(8.0 * decision))
            return float(np.clip(calibrated, 0.01, 0.99))
        except Exception:
            return 0.12

    def _predict_insurance(self, frame):
        model = self.models["insurance"]
        if hasattr(model, "predict_proba"):
            try:
                return bool(model.predict_proba(frame)[0][1] > 0.5)
            except Exception:
                return False
        return False

    def _shap_explain_pd(self, frame) -> List[Dict]:
        model = self.models["pd"]
        try:
            # Use TreeExplainer with check_additivity=False for faster computation
            explainer = shap.TreeExplainer(model, check_additivity=False)
            shap_values = explainer.shap_values(frame)
            if isinstance(shap_values, list):
                shap_values = shap_values[1]
            values = np.abs(np.array(shap_values)[0])
            order = np.argsort(values)[::-1][:3]
            return [
                {"feature": FEATURE_COLUMNS[i], "impact": float(values[i])}
                for i in order if i < len(FEATURE_COLUMNS)
            ]
        except Exception:
            # Fallback to model importances weighted by request values for dynamic explanations.
            values = np.abs(frame.iloc[0].to_numpy(dtype=float))
            if hasattr(model, "feature_importances_"):
                importances = np.abs(np.array(model.feature_importances_, dtype=float))
                if len(importances) == len(values):
                    impacts = importances * values
                else:
                    impacts = values
            else:
                impacts = values

            order = np.argsort(impacts)[::-1][:3]
            return [
                {"feature": FEATURE_COLUMNS[i], "impact": float(impacts[i])}
                for i in order if i < len(FEATURE_COLUMNS)
            ]
