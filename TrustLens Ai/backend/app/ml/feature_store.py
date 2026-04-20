from dataclasses import dataclass

import pandas as pd

from app.schemas.loan import LoanApplicationRequest


RISK_MAP = {"low": 0, "medium": 1, "high": 2}
EMPLOYMENT_MAP = {"salaried": 0, "self-employed": 1}


FEATURE_COLUMNS = [
    "age",
    "employment_type",
    "monthly_income",
    "loan_amount_requested",
    "loan_tenure_months",
    "existing_emi",
    "credit_score",
    "business_vintage_years",
    "industry_risk",
    "bank_balance_avg",
    "cashflow_volatility",
]


@dataclass
class FeatureStore:
    @staticmethod
    def to_frame(request: LoanApplicationRequest) -> pd.DataFrame:
        row = {
            "age": request.age,
            "employment_type": EMPLOYMENT_MAP[request.employment_type],
            "monthly_income": request.monthly_income,
            "loan_amount_requested": request.loan_amount_requested,
            "loan_tenure_months": request.loan_tenure_months,
            "existing_emi": request.existing_emi,
            "credit_score": request.credit_score,
            "business_vintage_years": request.business_vintage_years,
            "industry_risk": RISK_MAP[request.industry_risk],
            "bank_balance_avg": request.bank_balance_avg,
            "cashflow_volatility": request.cashflow_volatility,
        }
        return pd.DataFrame([row], columns=FEATURE_COLUMNS)
