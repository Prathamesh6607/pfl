from pathlib import Path
from typing import Dict, List

from app.schemas.loan import DocumentType, DocumentVerificationResponse


class DocumentVerificationService:
    ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
    MAX_SIZE_BYTES = 10 * 1024 * 1024
    MIN_SIZE_BYTES = 20 * 1024

    DOC_KEYWORDS = {
        "pan": ["pan"],
        "aadhaar": ["aadhaar", "aadhar", "uid"],
        "salary": ["salary", "payslip", "pay_slip"],
        "bank": ["bank", "statement", "account"],
        "address": ["address", "utility", "bill", "rent"],
        "photo": ["photo", "selfie", "passport"],
    }

    @staticmethod
    def _has_valid_signature(ext: str, data: bytes) -> bool:
        if ext == ".pdf":
            return data.startswith(b"%PDF")
        if ext == ".png":
            return data.startswith(b"\x89PNG\r\n\x1a\n")
        if ext in {".jpg", ".jpeg"}:
            return data.startswith(b"\xff\xd8")
        return False

    @staticmethod
    def _keyword_match(document_type: DocumentType, filename: str) -> bool:
        lowered = filename.lower()
        keywords = DocumentVerificationService.DOC_KEYWORDS.get(document_type, [])
        return any(keyword in lowered for keyword in keywords)

    def verify(self, document_type: DocumentType, filename: str, file_bytes: bytes) -> DocumentVerificationResponse:
        extension = Path(filename).suffix.lower()
        size_bytes = len(file_bytes)

        checks: Dict[str, bool] = {
            "supported_extension": extension in self.ALLOWED_EXTENSIONS,
            "size_within_limit": self.MIN_SIZE_BYTES <= size_bytes <= self.MAX_SIZE_BYTES,
            "valid_file_signature": self._has_valid_signature(extension, file_bytes),
            "filename_matches_document_type": self._keyword_match(document_type, filename),
        }

        confidence = 0.35
        confidence += 0.20 if checks["supported_extension"] else 0.0
        confidence += 0.20 if checks["valid_file_signature"] else 0.0
        confidence += 0.15 if checks["size_within_limit"] else 0.0
        confidence += 0.10 if checks["filename_matches_document_type"] else 0.0

        issues: List[str] = []
        if not checks["supported_extension"]:
            issues.append("unsupported_file_type")
        if not checks["valid_file_signature"]:
            issues.append("invalid_or_corrupted_file")
        if not checks["size_within_limit"]:
            issues.append("file_size_out_of_range")
        if not checks["filename_matches_document_type"]:
            issues.append("filename_document_mismatch")

        if not checks["supported_extension"] or not checks["valid_file_signature"]:
            verdict = "rejected"
            confidence = min(confidence, 0.45)
        elif confidence >= 0.75:
            verdict = "verified"
        else:
            verdict = "review_required"

        extracted_hints = {
            "detected_extension": extension or "unknown",
            "file_size_kb": str(round(size_bytes / 1024, 2)),
            "ai_note": "Heuristic AI verification completed",
        }

        return DocumentVerificationResponse(
            document_type=document_type,
            filename=filename,
            ai_verdict=verdict,
            confidence=round(confidence, 3),
            checks=checks,
            issues=issues,
            extracted_hints=extracted_hints,
        )
