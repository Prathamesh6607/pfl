import logging

from sqlalchemy.orm import Session

from app.models.entities import AuditLog


logger = logging.getLogger(__name__)


class AuditService:
    @staticmethod
    def write(db: Session, event_type: str, reference_id: str, payload: dict) -> None:
        db.add(AuditLog(event_type=event_type, reference_id=reference_id, payload=payload))
        db.commit()
        logger.info("Audit event recorded: %s (%s)", event_type, reference_id)
