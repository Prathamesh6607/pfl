from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Loan Decision Engine"
    app_env: str = "dev"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    database_url: str = "postgresql+psycopg://postgres:postgres@postgres:5432/loans"
    redis_url: str = "redis://redis:6379/0"

    model_dir: str = "artifacts"
    pd_model_path: str = "artifacts/pd_xgb_model.joblib"
    lgd_model_path: str = "artifacts/lgd_regressor.joblib"
    fraud_model_path: str = "artifacts/fraud_isolation_forest.joblib"
    insurance_model_path: str = "artifacts/insurance_xgb_model.joblib"
    feature_columns_path: str = "artifacts/feature_columns.json"

    interest_rate_base: float = 0.14
    insurance_coverage_pct: float = 0.25
    insurance_premium_pct_annual: float = 0.012
    fraud_threshold: float = 0.62

    celery_broker_url: str = "redis://redis:6379/1"
    celery_result_backend: str = "redis://redis:6379/2"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
