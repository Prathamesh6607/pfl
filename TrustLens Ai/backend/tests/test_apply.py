from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_apply_schema_validation():
    payload = {
        "user_id": "u-1001",
        "age": 37,
        "employment_type": "self-employed",
        "monthly_income": 120000,
        "loan_amount_requested": 700000,
        "loan_tenure_months": 36,
        "existing_emi": 8000,
        "credit_score": 730,
        "business_vintage_years": 4,
        "industry_risk": "medium",
        "bank_balance_avg": 180000,
        "cashflow_volatility": 0.24,
        "insurance_consent": True,
        "insurance_selected": True,
        "ekyc_consent": True,
        "ekyc_otp": "123456"
    }
    response = client.post("/loan/apply", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert "decision" in body
    assert len(body["offers"]) == 2
