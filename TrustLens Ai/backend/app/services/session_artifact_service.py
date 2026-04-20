from sqlalchemy.orm import Session

from app.models.entities import SessionArtifact
from app.schemas.loan import SessionArtifactRequest, SessionArtifactResponse
from app.services.audit_service import AuditService


class SessionArtifactService:
    @staticmethod
    def save(db: Session, payload: SessionArtifactRequest) -> SessionArtifactResponse:
        artifact = SessionArtifact(
            session_id=payload.session_id,
            user_external_id=payload.user_id,
            transcript_text=payload.transcript_text,
            consent_captured=payload.consent_captured,
            consent_phrase=payload.consent_phrase,
            latitude=payload.latitude,
            longitude=payload.longitude,
            device=payload.device,
            ip_address=payload.ip_address,
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)

        AuditService.write(
            db=db,
            event_type="session_artifact_recorded",
            reference_id=str(artifact.id),
            payload={
                "session_id": artifact.session_id,
                "user_id": artifact.user_external_id,
                "consent_captured": artifact.consent_captured,
                "has_transcript": bool(artifact.transcript_text),
                "geo_present": artifact.latitude is not None and artifact.longitude is not None,
            },
        )

        return SessionArtifactResponse(
            artifact_id=artifact.id,
            session_id=artifact.session_id,
            stored=True,
        )