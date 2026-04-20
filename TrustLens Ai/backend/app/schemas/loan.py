from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


EmploymentType = Literal["salaried", "self-employed"]
IndustryRisk = Literal["low", "medium", "high"]
DecisionType = Literal["approved", "rejected", "conditional"]


class LoanApplicationRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=64)
    age: int = Field(ge=18, le=75)
    employment_type: EmploymentType
    monthly_income: float = Field(gt=0)
    loan_amount_requested: float = Field(gt=0)
    loan_tenure_months: int = Field(ge=6, le=120)
    existing_emi: float = Field(ge=0)
    credit_score: int = Field(ge=300, le=900)
    business_vintage_years: float = Field(ge=0)
    industry_risk: IndustryRisk
    bank_balance_avg: float = Field(ge=0)
    cashflow_volatility: float = Field(ge=0, le=1)

    insurance_consent: bool = False
    insurance_selected: bool = False
    ekyc_consent: bool = True
    ekyc_otp: str = Field(default="123456", min_length=4, max_length=8)

    @field_validator("insurance_selected")
    @classmethod
    def insurance_requires_consent(cls, value: bool, info):
        consent = info.data.get("insurance_consent", False)
        if value and not consent:
            raise ValueError("insurance_selected requires insurance_consent=true")
        return value


class Offer(BaseModel):
    type: str
    approved_amount: float
    emi: float
    interest_rate: float
    tenure: int
    insurance_premium: float = 0.0


class ExplainabilityItem(BaseModel):
    feature: str
    impact: float


class LoanApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    application_id: str
    decision: DecisionType
    risk_score: float
    foir: float
    expected_loss: float
    insurance_recommended: bool
    ekyc_verified: bool
    offers: list[Offer]
    explanations: list[ExplainabilityItem]
    decision_reasons: list[str]
