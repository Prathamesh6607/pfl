from app.services.tasks import celery_app

# Keep module for explicit worker entrypoint.
__all__ = ["celery_app"]
