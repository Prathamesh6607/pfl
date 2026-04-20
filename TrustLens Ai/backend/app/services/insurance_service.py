from dataclasses import dataclass

from app.schemas.loan import LoanApplicationRequest


@dataclass
class InsuranceImpact:
    recommended: bool
    coverage_pct: float
    premium_monthly: float


class InsuranceService:
    def __init__(self, coverage_pct: float, premium_pct_annual: float) -> None:
        self.coverage_pct = coverage_pct
        self.premium_pct_annual = premium_pct_annual

    def should_recommend(self, request: LoanApplicationRequest, model_recommendation: bool, rule_decision: str) -> bool:
        rule_based = (
            request.loan_amount_requested > 500000
            and request.loan_tenure_months > 24
            and request.age > 35
            and rule_decision in {"conditional", "approved"}
            and request.industry_risk in {"medium", "high"}
        )
        return bool(rule_based or model_recommendation)

    def evaluate(self, request: LoanApplicationRequest, recommended: bool) -> InsuranceImpact:
        monthly_premium = (
            request.loan_amount_requested * self.premium_pct_annual / 12 if recommended else 0.0
        )
        return InsuranceImpact(
            recommended=recommended,
            coverage_pct=self.coverage_pct if recommended else 0.0,
            premium_monthly=monthly_premium,
        )
