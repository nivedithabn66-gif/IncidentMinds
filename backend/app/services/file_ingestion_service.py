import os
import re
import csv
import json
import io
import logging
from typing import List, Dict, Any, Tuple
from app.models.real_incident import UploadedFileMetadata

logger = logging.getLogger("IncidentMind.FileIngestionService")

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 # 10MB max limit per file
MAX_TEXT_CHARACTERS = 12000 # Max characters per file before chunking/truncating

ALLOWED_EXTENSIONS = {".txt", ".log", ".csv", ".json", ".md", ".pdf"}
REJECTED_EXTENSIONS = {".exe", ".dll", ".bat", ".sh", ".cmd", ".ps1", ".py", ".bin", ".js", ".vbs", ".jar", ".msi", ".com"}

# Regex rules for redacting obvious sensitive credentials (Section 19)
SECRET_PATTERNS = [
    (re.compile(r'(?i)(bearer\s+)[a-zA-Z0-9\-\._~\+\/]+=*'), r'\1[REDACTED_BEARER_TOKEN]'),
    (re.compile(r'(?i)(api[_\-]?key\s*[:=]\s*["\']?)[a-zA-Z0-9\-\._]{16,}["\']?'), r'\1[REDACTED_API_KEY]'),
    (re.compile(r'(?i)(password\s*[:=]\s*["\']?)[^\s"\'\`]+["\']?'), r'\1[REDACTED_PASSWORD]'),
    (re.compile(r'(?i)(secret\s*[:=]\s*["\']?)[^\s"\'\`]+["\']?'), r'\1[REDACTED_SECRET]'),
    (re.compile(r'AKIA[0-9A-Z]{16}'), r'[REDACTED_AWS_ACCESS_KEY]'),
    (re.compile(r'-----BEGIN\s+(PRIVATE|RSA\s+PRIVATE)\s+KEY-----[\s\S]*?-----END\s+\1\s+KEY-----'), r'[REDACTED_PRIVATE_KEY]')
]

class FileIngestionService:
    """
    Dedicated service for safe multi-format incident file ingestion,
    secret redaction, prompt injection shielding, and signal parsing.
    """

    def validate_file(self, filename: str, content_bytes: bytes) -> Tuple[bool, str]:
        """
        Validate file format, size, and security policy.
        Returns (is_valid, error_message).
        """
        ext = os.path.splitext(filename)[1].lower()

        if ext in REJECTED_EXTENSIONS:
            return False, f"Executable file extension '{ext}' is prohibited for security reasons."

        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Unsupported file format '{ext}'. Allowed formats: .txt, .log, .csv, .json, .md, .pdf."

        if len(content_bytes) > MAX_FILE_SIZE_BYTES:
            size_mb = round(len(content_bytes) / (1024 * 1024), 2)
            return False, f"File size ({size_mb} MB) exceeds maximum allowed limit of 10 MB."

        return True, ""

    def redact_secrets(self, text: str) -> Tuple[str, int]:
        """
        Scan and redact obvious API keys, passwords, and private tokens.
        Returns (redacted_text, count_of_redactions).
        """
        redactions_count = 0
        redacted_text = text
        for pattern, replacement in SECRET_PATTERNS:
            matches = len(pattern.findall(redacted_text))
            if matches > 0:
                redactions_count += matches
                redacted_text = pattern.sub(replacement, redacted_text)
        return redacted_text, redactions_count

    def parse_file_content(self, filename: str, content_bytes: bytes) -> Dict[str, Any]:
        """
        Safely parse raw bytes into structured text/data depending on extension.
        """
        ext = os.path.splitext(filename)[1].lower()
        redaction_count = 0
        parsed_text = ""
        structured_records = []
        truncated = False

        try:
            if ext in [".txt", ".log"]:
                parsed_text = content_bytes.decode("utf-8", errors="replace")

            elif ext == ".md":
                parsed_text = content_bytes.decode("utf-8", errors="replace")

            elif ext == ".json":
                raw_str = content_bytes.decode("utf-8", errors="replace")
                parsed_json = json.loads(raw_str)
                parsed_text = json.dumps(parsed_json, indent=2)
                if isinstance(parsed_json, dict):
                    structured_records.append(parsed_json)

            elif ext == ".csv":
                raw_str = content_bytes.decode("utf-8", errors="replace")
                reader = csv.DictReader(io.StringIO(raw_str))
                records = list(reader)
                parsed_text = f"CSV Header: {reader.fieldnames}\nRows count: {len(records)}\nSample:\n"
                for row in records[:15]:
                    parsed_text += str(dict(row)) + "\n"
                structured_records = records

            elif ext == ".pdf":
                try:
                    import pypdf
                    reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                    pdf_text = []
                    for idx, page in enumerate(reader.pages):
                        pdf_text.append(f"--- Page {idx+1} ---")
                        pdf_text.append(page.extract_text() or "")
                    parsed_text = "\n".join(pdf_text)
                except Exception as pdf_err:
                    logger.warning(f"pypdf extraction failed on {filename}: {pdf_err}")
                    parsed_text = f"[PDF Text Extraction Note]: Could not extract text from {filename} ({pdf_err})."

        except Exception as e:
            logger.error(f"Error parsing file {filename}: {e}")
            parsed_text = f"[File Parsing Error]: {str(e)}"

        # Apply Secret Redaction
        parsed_text, redaction_count = self.redact_secrets(parsed_text)

        # Chunking & Truncation for Large Files (Section 20)
        if len(parsed_text) > MAX_TEXT_CHARACTERS:
            parsed_text = parsed_text[:MAX_TEXT_CHARACTERS] + "\n\n[... EVIDENCE TRUNCATED FOR LLM PERFORMANCE ...]"
            truncated = True

        # Shield against Prompt Injection (Section 8)
        shielded_evidence = (
            f"<untrusted_incident_evidence filename=\"{filename}\">\n"
            f"{parsed_text}\n"
            f"</untrusted_incident_evidence>"
        )

        return {
            "filename": filename,
            "file_type": ext[1:],
            "file_size_bytes": len(content_bytes),
            "parsed_text": parsed_text,
            "shielded_evidence": shielded_evidence,
            "redactions_count": redaction_count,
            "truncated": truncated,
            "structured_records": structured_records
        }

file_ingestion_service = FileIngestionService()
