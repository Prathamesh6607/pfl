from celery import Celery

from app.utils.config import get_settings


settings = get_settings()
celery_app = Celery("loan_decision_engine", broker=settings.celery_broker_url, backend=settings.celery_result_backend)


@celery_app.task(name="audit.log")
def log_audit_event(event_type: str, reference_id: str, payload: dict):
    # In production, this task can publish to SIEM or immutable logs.
    return {"event_type": event_type, "reference_id": reference_id, "payload": payload}
