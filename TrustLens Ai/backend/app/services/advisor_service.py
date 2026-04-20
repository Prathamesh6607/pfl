import time
from typing import Dict, List

import httpx

from app.schemas.advisor import AdvisorChatRequest, AdvisorChatResponse
from app.utils.config import get_settings


MOCK_RESPONSES = {
    "loan": "Key factors for loan approval include: (1) Credit score above 650, (2) Debt-to-income ratio under 40%, (3) Stable employment (min 2 years), (4) Sufficient collateral if needed, and (5) No recent defaults. Most lenders also review your savings history and existing liabilities.",
    "interest": "Interest rates depend on several factors: credit score (primary driver), loan amount, term length, type of collateral, and current market rates. Typically, rates range from 8-20% for personal loans. Your specific rate will be determined after full assessment.",
    "approval": "Approval timelines vary: pre-approval (1-2 days), full underwriting (3-5 days), final approval (1-2 days). Document verification and any requests for additional information can extend this. Most applications are resolved within 7-10 business days.",
    "document": "Common required documents: (1) Government ID, (2) Recent pay stubs, (3) Tax returns (last 2 years), (4) Bank statements, (5) Proof of residence, (6) Employment verification letter. Digital submission is available and securely processed.",
    "default": "For more information about our loan services, credit requirements, or the application process, please ask a specific question. I'm here to help clarify any aspects of your loan journey.",
}


class AdvisorService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def chat(self, payload: AdvisorChatRequest) -> AdvisorChatResponse:
        started = time.perf_counter()

        # Check if using mock provider
        if self.settings.advisor_provider == "mock":
            return self._generate_mock_response(payload, started)

        # Real provider logic
        system_prompt = (
            "You are TrustLens AI, a real-time loan advisor. "
            f"Reply strictly in {payload.language}. "
            "Keep answers concise, practical, and compliant. "
            "Do not hallucinate policy rules; if unknown, say what is missing."
        )

        context_note = ""
        if payload.context:
            context_note = f"\n\nApplication context: {payload.context}"

        messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt + context_note}]
        for item in payload.messages:
            role = "assistant" if item.role == "assistant" else "user"
            messages.append({"role": role, "content": item.text})

        endpoint = self.settings.advisor_api_base.rstrip("/") + "/chat/completions"
        headers = {"Content-Type": "application/json"}
        if self.settings.advisor_api_key:
            headers["Authorization"] = f"Bearer {self.settings.advisor_api_key}"

        request_body = {
            "model": self.settings.advisor_model,
            "messages": messages,
            "temperature": self.settings.advisor_temperature,
            "max_tokens": 500,
        }

        async with httpx.AsyncClient(timeout=self.settings.advisor_timeout_seconds) as client:
            response = await client.post(endpoint, json=request_body, headers=headers)
            response.raise_for_status()
            data = response.json()

        reply = ""
        choices = data.get("choices") or []
        if choices:
            reply = (choices[0].get("message") or {}).get("content") or ""
        if not reply:
            reply = "I could not generate a response right now. Please try again."

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        return AdvisorChatResponse(
            reply=reply.strip(),
            provider=self.settings.advisor_provider,
            model=self.settings.advisor_model,
            latency_ms=elapsed_ms,
        )

    def _generate_mock_response(self, payload: AdvisorChatRequest, started: float) -> AdvisorChatResponse:
        """Generate mock response matching real advisor format."""
        user_text = payload.messages[-1].text.lower() if payload.messages else ""

        reply = MOCK_RESPONSES["default"]
        if any(word in user_text for word in ["loan", "approval", "factor"]):
            reply = MOCK_RESPONSES["loan"]
        elif any(word in user_text for word in ["interest", "rate"]):
            reply = MOCK_RESPONSES["interest"]
        elif any(word in user_text for word in ["approve", "timeline", "how long"]):
            reply = MOCK_RESPONSES["approval"]
        elif any(word in user_text for word in ["document", "required", "submit"]):
            reply = MOCK_RESPONSES["document"]

        elapsed_ms = int((time.perf_counter() - started) * 1000)
        return AdvisorChatResponse(
            reply=reply,
            provider="mock-local-advisor",
            model="TrustLens-Mock-v1",
            latency_ms=elapsed_ms,
        )