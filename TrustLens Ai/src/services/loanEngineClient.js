const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function applyLoanDecision(payload) {
  const response = await fetch(`${API_BASE_URL}/loan/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Loan engine request failed with status ${response.status}`);
  }

  return response.json();
}

export async function verifyLoanDocument(documentType, file) {
  const formData = new FormData();
  formData.append("document_type", documentType);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/loan/verify-document`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Document verification failed with status ${response.status}`);
  }

  return response.json();
}

export async function captureSessionArtifact(payload) {
  const response = await fetch(`${API_BASE_URL}/loan/session-artifacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Session artifact capture failed with status ${response.status}`);
  }

  return response.json();
}
