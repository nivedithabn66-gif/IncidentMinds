from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

import uuid

class TimelineEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:8]}")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    event_type: str  # "detection", "memory_search", "action", "recommendation", "resolution"
    title: str
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

IncidentTimelineEvent = TimelineEvent

class ActionAttempt(BaseModel):
    action_id: str
    action_name: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    executed_at: Optional[str] = None
    status: str  # "FAILED", "SUCCESS", "INCONCLUSIVE"
    result_message: str
    reason: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)

class Incident(BaseModel):
    incident_id: str
    title: str
    severity: str  # "critical", "warning", "info"
    service: str
    timestamp: str
    status: str  # "active", "investigating", "resolved"
    symptoms: List[str]
    metrics: Dict[str, Any]
    logs: List[str]
    recent_changes: List[str]
    possible_causes: List[str]
    
    # Investigation history
    timeline: List[TimelineEvent] = Field(default_factory=list)
    failed_attempts: List[ActionAttempt] = Field(default_factory=list)
    successful_actions: List[ActionAttempt] = Field(default_factory=list)
    
    # Resolution details
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    lesson_learned: Optional[str] = None
    
    # Memory attachment (from Hindsight recall)
    memory_recalled: Optional[Dict[str, Any]] = None

class IncidentCreate(BaseModel):
    title: str
    severity: str
    service: str
    symptoms: List[str]
    metrics: Dict[str, Any]
    logs: List[str]
    recent_changes: List[str]

class InvestigationRequest(BaseModel):
    user_notes: Optional[str] = None

class ActionRequest(BaseModel):
    action_id: str  # e.g., "increase_cache", "check_db_pool", "restart_service"
    action_name: str
    params: Dict[str, Any] = Field(default_factory=dict)

class ResolutionRequest(BaseModel):
    root_cause: str
    resolution: str
    lesson_learned: str
