from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.models.db import get_db
from app.schemas.loan import (
    DocumentType,
    DocumentVerificationResponse,
    LoanApplicationRequest,
    LoanApplicationResponse,
    SessionArtifactRequest,
    SessionArtifactResponse,
)
from app.services.decision_service import LoanDecisionService
from app.services.document_verification_service import DocumentVerificationService
from app.services.session_artifact_service import SessionArtifactService


router = APIRouter(prefix="/loan", tags=["loan"])
service = LoanDecisionService()
document_service = DocumentVerificationService()
session_artifact_service = SessionArtifactService()


@router.post("/apply", response_model=LoanApplicationResponse)
def apply_loan(payload: LoanApplicationRequest, db: Session = Depends(get_db)) -> LoanApplicationResponse:
    return service.apply(db=db, request=payload)


@router.post("/verify-document", response_model=DocumentVerificationResponse)
async def verify_document(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
) -> DocumentVerificationResponse:
    file_bytes = await file.read()
    return document_service.verify(
        document_type=document_type,
        filename=file.filename or "uploaded_document",
        file_bytes=file_bytes,
    )


@router.post("/session-artifacts", response_model=SessionArtifactResponse)
def capture_session_artifact(
    payload: SessionArtifactRequest,
    db: Session = Depends(get_db),
) -> SessionArtifactResponse:
    return session_artifact_service.save(db=db, payload=payload)
