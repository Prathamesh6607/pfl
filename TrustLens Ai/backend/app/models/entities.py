import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications = relationship("LoanApplication", back_populates="user")


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(24), default="submitted")
    ekyc_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    risk_score = relationship("RiskScore", back_populates="application", uselist=False)
    decision = relationship("Decision", back_populates="application", uselist=False)


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("loan_applications.id"), unique=True)
    pd: Mapped[float] = mapped_column(Float)
    lgd: Mapped[float] = mapped_column(Float)
    ead: Mapped[float] = mapped_column(Float)
    fraud_score: Mapped[float] = mapped_column(Float)
    expected_loss: Mapped[float] = mapped_column(Float)
    top_features: Mapped[dict] = mapped_column(JSON)

    application = relationship("LoanApplication", back_populates="risk_score")


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("loan_applications.id"), unique=True)
    decision: Mapped[str] = mapped_column(String(20))
    reason: Mapped[str] = mapped_column(Text)
    risk_score: Mapped[float] = mapped_column(Float)
    offers: Mapped[dict] = mapped_column(JSON)
    audit_meta: Mapped[dict] = mapped_column(JSON)

    application = relationship("LoanApplication", back_populates="decision")


class InsuranceSelection(Base):
    __tablename__ = "insurance_selections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    application_id: Mapped[str] = mapped_column(String(36), ForeignKey("loan_applications.id"), unique=True)
    selected: Mapped[bool] = mapped_column(Boolean, default=False)
    consent: Mapped[bool] = mapped_column(Boolean, default=False)
    premium: Mapped[float] = mapped_column(Float, default=0.0)
    coverage_pct: Mapped[float] = mapped_column(Float, default=0.0)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    reference_id: Mapped[str] = mapped_column(String(80), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SessionArtifact(Base):
    __tablename__ = "session_artifacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(80), index=True)
    user_external_id: Mapped[str] = mapped_column(String(64), index=True)
    transcript_text: Mapped[str] = mapped_column(Text, default="")
    consent_captured: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_phrase: Mapped[str] = mapped_column(String(255), default="")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    device: Mapped[str] = mapped_column(String(255), default="")
    ip_address: Mapped[str] = mapped_column(String(64), default="")
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
