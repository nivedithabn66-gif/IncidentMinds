from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class IncidentMemoryExperience(BaseModel):
    """Structured representation of an incident experience stored in Hindsight."""
    incident_id: str
    service: str
    incident_type: str = "performance_degradation"
    symptoms: List[str] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    recent_changes: List[str] = Field(default_factory=list)
    investigation_action: Optional[str] = None
    action_result: Optional[str] = None
    success_or_failure: Optional[str] = None  # "SUCCESS" | "FAILED"
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    lesson: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class MemoryBankInfo(BaseModel):
    bank_id: str = "incidentmind_sre"
    total_memories: int = 0
    categories_count: Dict[str, int] = Field(default_factory=dict)
    last_updated: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    hindsight_connected: bool = False
    mode: str = "fallback_semantic_engine"

class MemoryRecallQuery(BaseModel):
    incident_id: Optional[str] = None
    query_text: str
    service: Optional[str] = None
    symptoms: List[str] = Field(default_factory=list)
    top_k: int = 3
    memory_enabled: bool = True

class MemoryRecallItem(BaseModel):
    memory_id: str
    incident_id: str
    title: str
    service: str
    similarity_score: float = 0.85
    relevance_label: str = "Highly relevant historical experience"
    matched_symptoms: List[str] = Field(default_factory=list)
    failed_approaches: List[str] = Field(default_factory=list)
    successful_approaches: List[str] = Field(default_factory=list)
    root_cause: str
    resolution: str
    lesson_learned: str
    match_rationale: str
    timestamp: str

class MemoryRecallResponse(BaseModel):
    query: str
    memory_enabled: bool = True
    recalled_count: int = 0
    top_match: Optional[MemoryRecallItem] = None
    historical_matches: List[MemoryRecallItem] = Field(default_factory=list)
    avoid_failed_approaches: List[str] = Field(default_factory=list)
    prioritized_actions: List[str] = Field(default_factory=list)
    hindsight_active: bool = False
    hindsight_mode: str = "fallback_semantic_engine"
