from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.db import get_db
from app.schemas.loan import LoanApplicationRequest, LoanApplicationResponse
from app.services.decision_service import LoanDecisionService


router = APIRouter(prefix="/loan", tags=["loan"])
service = LoanDecisionService()


@router.post("/apply", response_model=LoanApplicationResponse)
def apply_loan(payload: LoanApplicationRequest, db: Session = Depends(get_db)) -> LoanApplicationResponse:
    return service.apply(db=db, request=payload)
