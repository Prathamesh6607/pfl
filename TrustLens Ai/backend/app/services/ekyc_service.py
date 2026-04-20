from dataclasses import dataclass
from typing import Optional


@dataclass
class EkycResult:
    verified: bool
    auth_token: Optional[str]
    message: str


class DummyEkycEngine:
    def verify(self, user_id: str, otp: str, consent: bool) -> EkycResult:
        if not consent:
            return EkycResult(verified=False, auth_token=None, message="ekyc_consent_required")
        if otp != "123456":
            return EkycResult(verified=False, auth_token=None, message="invalid_otp")
        token = f"ekyc-token-{user_id[-8:]}"
        return EkycResult(verified=True, auth_token=token, message="verified")
