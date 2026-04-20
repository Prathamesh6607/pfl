# Loan Decision Engine (FastAPI + ML)

Production-style backend for business loan decisioning with optional insurance and dummy eKYC.

## Highlights

- FastAPI API layer with modular architecture under app/
- PostgreSQL persistence (users, loan_applications, risk_scores, decisions, insurance_selections, audit_logs)
- Redis response caching
- ML inference pipeline:
  - PD (XGBoost classifier)
  - LGD (XGBoost regressor)
  - Fraud (Isolation Forest)
  - Insurance recommendation (XGBoost classifier)
- SHAP-based feature explanation (top 3)
- Rule engine with hard reject / conditional / full approval
- Optional insurance with explicit consent
- Dummy eKYC integration with OTP auth
- Dockerized runtime + Celery worker

## Project structure

backend/
  app/
    api/
    models/
    services/
    ml/
    rules/
    schemas/
    utils/

## Quick start (Docker)

1. Copy env file:
   cp .env.example .env
2. Build and run:
   docker compose up --build
3. Open docs:
   http://localhost:8000/docs

## Local run (without Docker)

1. Create a virtual env and activate it
2. Install dependencies:
   pip install -r requirements.txt
3. Train mock models:
   python -m app.ml.train_models
4. Start API:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## API

- POST /loan/apply

Example:

curl -X POST http://localhost:8000/loan/apply \
  -H "Content-Type: application/json" \
  -d @sample_request.json

## eKYC dummy auth

- Set ekyc_consent=true
- Use ekyc_otp="123456" for successful verification

## Notes

- Insurance is optional and requires insurance_consent=true if selected.
- Rule thresholds are configurable in app/rules/thresholds.yaml.
- The engine returns two offers: without_insurance and with_insurance.
