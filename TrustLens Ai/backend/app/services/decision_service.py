from pathlib import Path

from sqlalchemy.orm import Session

from app.ml.inference import InferenceEngine
from app.ml.model_registry import ModelRegistry
from app.models.entities import Decision, InsuranceSelection, LoanApplication, RiskScore, User
from app.rules.decision_rules import RuleEngine
from app.schemas.loan import ExplainabilityItem, LoanApplicationRequest, LoanApplicationResponse
from app.services.audit_service import AuditService
from app.services.cache_service import CacheService
from app.services.ekyc_service import DummyEkycEngine
from app.services.insurance_service import InsuranceService
from app.services.offer_service import OfferContext, OfferService
from app.services.tasks import log_audit_event
from app.utils.config import get_settings
from app.utils.finance import calculate_emi, calculate_foir


class LoanDecisionService:
    def __init__(self) -> None:
        settings = get_settings()
        thresholds_path = Path(__file__).resolve().parents[1] / "rules" / "thresholds.yaml"
        self.rule_engine = RuleEngine(thresholds_path=thresholds_path)
        self.inference_engine = InferenceEngine(models=ModelRegistry().load_or_build())
        self.offer_service = OfferService()
        self.ekyc_engine = DummyEkycEngine()
        self.insurance_service = InsuranceService(
            coverage_pct=settings.insurance_coverage_pct,
            premium_pct_annual=settings.insurance_premium_pct_annual,
        )
        self.cache_service = CacheService()
        self.settings = settings

    def apply(self, db: Session, request: LoanApplicationRequest) -> LoanApplicationResponse:
        cache_key = f"loan:decision:{request.user_id}:{request.loan_amount_requested}:{request.loan_tenure_months}"
        cached = self.cache_service.get(cache_key)
        if cached:
            return LoanApplicationResponse(**cached)

        ekyc_result = self.ekyc_engine.verify(
            user_id=request.user_id,
            otp=request.ekyc_otp,
            consent=request.ekyc_consent,
        )

        user = db.query(User).filter(User.external_user_id == request.user_id).first()
        if not user:
            user = User(external_user_id=request.user_id)
            db.add(user)
            db.commit()
            db.refresh(user)

        app = LoanApplication(
            user_id=user.id,
            payload=request.model_dump(),
            status="under_review",
            ekyc_verified=ekyc_result.verified,
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        predicted = self.inference_engine.predict(request)
        proposed_emi = calculate_emi(
            principal=request.loan_amount_requested,
            annual_rate=self.settings.interest_rate_base,
            tenure_months=request.loan_tenure_months,
        )
        foir = calculate_foir(request.existing_emi, proposed_emi, request.monthly_income)

        rule_outcome = self.rule_engine.evaluate(request=request, foir=foir, fraud_score=predicted.fraud_score)

        insurance_recommended = self.insurance_service.should_recommend(
            request=request,
            model_recommendation=predicted.insurance_recommended,
            rule_decision=rule_outcome.decision,
        )
        insurance = self.insurance_service.evaluate(request, insurance_recommended)

        ead = request.loan_amount_requested
        expected_loss = predicted.pd * predicted.lgd * ead

        insurance_selected = bool(request.insurance_selected and request.insurance_consent)
        adjusted_lgd = predicted.lgd
        if insurance_selected:
            adjusted_lgd = max(0.0, predicted.lgd - insurance.coverage_pct)
            expected_loss = predicted.pd * adjusted_lgd * ead

        risk_score = float(min(0.99, predicted.pd * 0.5 + adjusted_lgd * 0.35 + predicted.fraud_score * 0.15))

        offers = self.offer_service.build_offers(
            OfferContext(
                requested_amount=request.loan_amount_requested,
                tenure_months=request.loan_tenure_months,
                base_interest_rate=self.settings.interest_rate_base,
                risk_score=risk_score,
                insurance_selected=insurance_selected,
                insurance_premium=insurance.premium_monthly if insurance_selected else insurance.premium_monthly,
            )
        )

        db.add(
            RiskScore(
                application_id=app.id,
                pd=predicted.pd,
                lgd=adjusted_lgd,
                ead=ead,
                fraud_score=predicted.fraud_score,
                expected_loss=expected_loss,
                top_features=predicted.top_features,
            )
        )

        decision = Decision(
            application_id=app.id,
            decision=rule_outcome.decision,
            reason=", ".join(rule_outcome.reasons),
            risk_score=risk_score,
            offers=[o.model_dump() for o in offers],
            audit_meta={
                "foir": foir,
                "ekyc_verified": ekyc_result.verified,
                "insurance_recommended": insurance_recommended,
                "insurance_selected": insurance_selected,
            },
        )
        db.add(decision)

        db.add(
            InsuranceSelection(
                application_id=app.id,
                selected=insurance_selected,
                consent=request.insurance_consent,
                premium=insurance.premium_monthly if insurance_selected else 0.0,
                coverage_pct=insurance.coverage_pct if insurance_selected else 0.0,
            )
        )

        db.commit()

        audit_payload = {
            "decision": rule_outcome.decision,
            "reasons": rule_outcome.reasons,
            "risk_score": risk_score,
            "expected_loss": expected_loss,
        }
        AuditService.write(db, "loan_decision", str(app.id), audit_payload)
        if self.cache_service.available:
            try:
                log_audit_event.delay("loan_decision", str(app.id), audit_payload)
            except Exception:
                # Celery broker may be temporarily unavailable.
                pass

        response = LoanApplicationResponse(
            application_id=str(app.id),
            decision=rule_outcome.decision,
            risk_score=round(risk_score, 4),
            foir=round(foir, 4),
            expected_loss=round(expected_loss, 2),
            insurance_recommended=insurance_recommended,
            ekyc_verified=ekyc_result.verified,
            offers=offers,
            explanations=[ExplainabilityItem(**item) for item in predicted.top_features],
            decision_reasons=rule_outcome.reasons,
        )

        self.cache_service.set(cache_key, response.model_dump())
        return response
