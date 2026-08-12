from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class UploadedFileMetadata(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size_bytes: int
    status: str = "uploaded" # uploaded | parsed | error
    error_message: Optional[str] = None

class NormalizedIncidentEvidence(BaseModel):
    session_id: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source_type: str = "real_world_ingestion" # real_world_ingestion | demo_simulation
    files: List[UploadedFileMetadata] = Field(default_factory=list)
    service: str = "unknown-service"
    incident_type: str = "performance_degradation"
    
    # Critical Distinction: OBSERVED FACTS vs AI INFERENCES (Section 7)
    observed_facts: List[str] = Field(default_factory=list)
    inferences: List[str] = Field(default_factory=list)
    
    symptoms: List[str] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    errors: List[str] = Field(default_factory=list)
    logs: List[str] = Field(default_factory=list)
    deployments: List[str] = Field(default_factory=list)
    timestamps: List[str] = Field(default_factory=list)
    possible_causes: List[str] = Field(default_factory=list)
    raw_evidence_summary: str = ""
    
    truncated: bool = False
    secrets_redacted_count: int = 0
    status: str = "uploaded" # uploaded | analyzed | investigating | resolved
    
    investigation_history: List[Dict[str, Any]] = Field(default_factory=list)
    hindsight_memories_recalled: List[Dict[str, Any]] = Field(default_factory=list)
    recalled_memory_source: str = "hindsight_cloud" # hindsight_cloud | demo_memory | none
    
    ai_assessment: Dict[str, Any] = Field(default_factory=dict)
    outcome_confirmed: Optional[Dict[str, Any]] = None
    memory_stored: bool = False

class RealIncidentOutcomeRequest(BaseModel):
    outcome_status: str # "confirmed_root_cause" | "partially_confirmed" | "inconclusive" | "different_root_cause" | "resolved"
    confirmed_root_cause: str
    actual_resolution: str
    lesson_learned: str
    successful_action: Optional[str] = None
    failed_actions: List[str] = Field(default_factory=list)
