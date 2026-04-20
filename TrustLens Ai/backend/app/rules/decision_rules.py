from dataclasses import dataclass
from pathlib import Path

import yaml

from app.schemas.loan import LoanApplicationRequest


@dataclass
class RuleOutcome:
    decision: str
    reasons: list[str]


class RuleEngine:
    def __init__(self, thresholds_path: str | Path):
        with open(thresholds_path, "r", encoding="utf-8") as fh:
            self.thresholds = yaml.safe_load(fh)

    def evaluate(
        self,
        request: LoanApplicationRequest,
        foir: float,
        fraud_score: float,
    ) -> RuleOutcome:
        t = self.thresholds["risk"]
        reasons: list[str] = []

        if request.credit_score < t["credit_score_hard_reject"]:
            reasons.append("credit_score_below_threshold")
        if foir > t["foir_medium"]:
            reasons.append("foir_above_0_6")
        if request.business_vintage_years < t["min_business_vintage_years"]:
            reasons.append("business_vintage_below_1_year")
        if fraud_score > t["fraud_threshold"]:
            reasons.append("fraud_score_above_threshold")

        if reasons:
            return RuleOutcome(decision="rejected", reasons=reasons)

        if (
            request.credit_score > t["credit_score_full_approval"]
            and foir <= t["foir_safe"]
        ):
            return RuleOutcome(decision="approved", reasons=["meets_full_approval_criteria"])

        if t["credit_score_hard_reject"] <= request.credit_score <= t["credit_score_full_approval"]:
            return RuleOutcome(decision="conditional", reasons=["credit_score_in_conditional_band"])

        return RuleOutcome(decision="conditional", reasons=["manual_review_required"])
