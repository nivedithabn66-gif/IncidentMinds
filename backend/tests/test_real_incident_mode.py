import pytest
from app.services.file_ingestion_service import file_ingestion_service
from app.services.real_incident_service import real_incident_service
from app.models.real_incident import RealIncidentOutcomeRequest

def test_file_validation_rejects_executables():
    """Verify executable file formats (.exe, .sh, .bat) are rejected."""
    is_valid, msg = file_ingestion_service.validate_file("malicious.exe", b"binary content")
    assert is_valid is False
    assert "prohibited" in msg.lower()

    is_valid, msg = file_ingestion_service.validate_file("script.sh", b"#!/bin/bash\nrm -rf /")
    assert is_valid is False

def test_file_validation_accepts_valid_formats():
    """Verify allowed formats (.txt, .log, .csv, .json, .md, .pdf) are accepted."""
    for fn in ["log.txt", "app.log", "data.csv", "config.json", "report.md", "doc.pdf"]:
        is_valid, msg = file_ingestion_service.validate_file(fn, b"sample text content")
        assert is_valid is True

def test_secret_redaction():
    """Verify bearer tokens, API keys, and passwords are redacted."""
    raw_log = "Authorization: Bearer secret_token_123456789\napi_key: AKIAIOSFODNN7EXAMPLE\npassword: super_secret_pass"
    redacted, count = file_ingestion_service.redact_secrets(raw_log)
    assert count >= 2
    assert "secret_token_123456789" not in redacted
    assert "AKIAIOSFODNN7EXAMPLE" not in redacted
    assert "[REDACTED" in redacted

def test_multi_file_ingestion_and_hindsight_loop():
    """Verify end-to-end multi-file processing, signal extraction, Hindsight search, and outcome retention."""
    log_bytes = b"2026-08-12 14:03:15 ERROR [payment-api] Connection pool exhausted: 98/100 active connections\nHTTP 504 Gateway Timeout latency: 5.4s"
    csv_bytes = b"service,latency_sec,db_conn_pct\npayment-api,5.4,98"

    # 1. Ingest files and create session
    session = real_incident_service.process_uploaded_files([
        ("api-error.log", log_bytes),
        ("metrics.csv", csv_bytes)
    ])
    assert session.session_id.startswith("REAL-")
    assert len(session.files) == 2
    assert session.service == "payment-api"
    assert len(session.observed_facts) > 0
    assert len(session.inferences) > 0

    # 2. Analyze session using Hindsight memory
    analyzed = real_incident_service.analyze_real_incident(session.session_id)
    assert analyzed.status == "analyzed"
    assert "ai_assessment" in analyzed.dict()
    assert analyzed.ai_assessment["recommended_next_step"]["simulation_only"] is True

    # 3. Execute simulation-only action
    sim = real_incident_service.simulate_investigation_action(session.session_id, "Inspect Database Connection Pool")
    assert sim["type"] == "simulation_only"

    # 4. Record outcome and store memory in Hindsight
    outcome_req = RealIncidentOutcomeRequest(
        outcome_status="confirmed_root_cause",
        confirmed_root_cause="Database connection pool exhaustion caused by high concurrent request volume.",
        actual_resolution="Expanded connection pool limit to 300.",
        lesson_learned="High latency + high DB connection saturation requires DB pool inspection before cache scaling."
    )
    resolved = real_incident_service.record_outcome_and_store_memory(session.session_id, outcome_req)
    assert resolved.status == "resolved"
    assert resolved.memory_stored is True
