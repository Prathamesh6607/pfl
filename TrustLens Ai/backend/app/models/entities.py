import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications = relationship("LoanApplication", back_populates="user")


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    payload: Mapped[dict] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(24), default="submitted")
    ekyc_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    risk_score = relationship("RiskScore", back_populates="application", uselist=False)
    decision = relationship("Decision", back_populates="application", uselist=False)


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), unique=True)
    pd: Mapped[float] = mapped_column(Float)
    lgd: Mapped[float] = mapped_column(Float)
    ead: Mapped[float] = mapped_column(Float)
    fraud_score: Mapped[float] = mapped_column(Float)
    expected_loss: Mapped[float] = mapped_column(Float)
    top_features: Mapped[dict] = mapped_column(JSONB)

    application = relationship("LoanApplication", back_populates="risk_score")


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), unique=True)
    decision: Mapped[str] = mapped_column(String(20))
    reason: Mapped[str] = mapped_column(Text)
    risk_score: Mapped[float] = mapped_column(Float)
    offers: Mapped[dict] = mapped_column(JSONB)
    audit_meta: Mapped[dict] = mapped_column(JSONB)

    application = relationship("LoanApplication", back_populates="decision")


class InsuranceSelection(Base):
    __tablename__ = "insurance_selections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("loan_applications.id"), unique=True)
    selected: Mapped[bool] = mapped_column(Boolean, default=False)
    consent: Mapped[bool] = mapped_column(Boolean, default=False)
    premium: Mapped[float] = mapped_column(Float, default=0.0)
    coverage_pct: Mapped[float] = mapped_column(Float, default=0.0)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    reference_id: Mapped[str] = mapped_column(String(80), index=True)
    payload: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
