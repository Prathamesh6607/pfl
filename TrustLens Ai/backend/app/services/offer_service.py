from dataclasses import dataclass

from app.schemas.loan import Offer
from app.utils.finance import calculate_emi


@dataclass
class OfferContext:
    requested_amount: float
    tenure_months: int
    base_interest_rate: float
    risk_score: float
    insurance_selected: bool
    insurance_premium: float


class OfferService:
    def build_offers(self, context: OfferContext) -> list[Offer]:
        risk_markup = min(0.08, context.risk_score * 0.12)
        offer_a_rate = context.base_interest_rate + risk_markup
        offer_a_approved = context.requested_amount * max(0.45, 1 - context.risk_score)
        offer_a_emi = calculate_emi(offer_a_approved, offer_a_rate, context.tenure_months)

        offer_b_rate = max(0.08, offer_a_rate - 0.012)
        offer_b_approved = min(context.requested_amount, offer_a_approved * 1.18)
        offer_b_emi = calculate_emi(offer_b_approved, offer_b_rate, context.tenure_months) + context.insurance_premium

        return [
            Offer(
                type="without_insurance",
                approved_amount=round(offer_a_approved, 2),
                emi=round(offer_a_emi, 2),
                interest_rate=round(offer_a_rate, 4),
                tenure=context.tenure_months,
                insurance_premium=0.0,
            ),
            Offer(
                type="with_insurance",
                approved_amount=round(offer_b_approved, 2),
                emi=round(offer_b_emi, 2),
                interest_rate=round(offer_b_rate, 4),
                tenure=context.tenure_months,
                insurance_premium=round(context.insurance_premium, 2),
            ),
        ]
