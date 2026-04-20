import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from xgboost import XGBClassifier, XGBRegressor

from app.ml.feature_store import FEATURE_COLUMNS
from app.utils.config import get_settings


def _build_mock_data(size: int = 3000) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    df = pd.DataFrame(
        {
            "age": rng.integers(21, 65, size=size),
            "employment_type": rng.integers(0, 2, size=size),
            "monthly_income": rng.normal(90000, 25000, size=size).clip(15000, 500000),
            "loan_amount_requested": rng.normal(600000, 250000, size=size).clip(50000, 3000000),
            "loan_tenure_months": rng.integers(6, 72, size=size),
            "existing_emi": rng.normal(12000, 9000, size=size).clip(0, 100000),
            "credit_score": rng.normal(710, 60, size=size).clip(350, 850),
            "business_vintage_years": rng.normal(4.5, 2.0, size=size).clip(0, 20),
            "industry_risk": rng.integers(0, 3, size=size),
            "bank_balance_avg": rng.normal(220000, 120000, size=size).clip(1000, 2000000),
            "cashflow_volatility": rng.uniform(0.02, 0.8, size=size),
        }
    )

    pd_target = (
        (df["credit_score"] < 680).astype(int)
        | (df["cashflow_volatility"] > 0.45).astype(int)
        | (df["existing_emi"] > (df["monthly_income"] * 0.4)).astype(int)
    ).astype(int)

    lgd_target = (
        0.15
        + (700 - df["credit_score"]).clip(0, 500) / 2000
        + df["cashflow_volatility"] * 0.4
        + (df["industry_risk"] * 0.08)
    ).clip(0.05, 0.95)

    insurance_target = (
        (df["loan_amount_requested"] > 500000)
        & (df["loan_tenure_months"] > 24)
        & (df["age"] > 35)
        & ((pd_target > 0) | (df["industry_risk"] > 0))
    ).astype(int)

    df["pd_target"] = pd_target
    df["lgd_target"] = lgd_target
    df["insurance_target"] = insurance_target
    return df


def main() -> None:
    settings = get_settings()
    Path(settings.model_dir).mkdir(parents=True, exist_ok=True)

    df = _build_mock_data()
    x = df[FEATURE_COLUMNS]

    pd_model = XGBClassifier(n_estimators=180, max_depth=4, learning_rate=0.05, eval_metric="logloss")
    pd_model.fit(x, df["pd_target"])

    lgd_model = XGBRegressor(n_estimators=220, max_depth=4, learning_rate=0.04)
    lgd_model.fit(x, df["lgd_target"])

    fraud_model = IsolationForest(n_estimators=180, contamination=0.08, random_state=42)
    fraud_model.fit(x)

    insurance_model = XGBClassifier(n_estimators=160, max_depth=4, learning_rate=0.05, eval_metric="logloss")
    insurance_model.fit(x, df["insurance_target"])

    joblib.dump(pd_model, settings.pd_model_path)
    joblib.dump(lgd_model, settings.lgd_model_path)
    joblib.dump(fraud_model, settings.fraud_model_path)
    joblib.dump(insurance_model, settings.insurance_model_path)

    with open(settings.feature_columns_path, "w", encoding="utf-8") as fh:
        json.dump(FEATURE_COLUMNS, fh)

    print("Models trained and persisted in artifacts/.")


if __name__ == "__main__":
    main()
