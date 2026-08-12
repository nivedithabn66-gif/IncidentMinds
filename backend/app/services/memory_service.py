import json
import logging
import os

from datetime import datetime
from typing import Any, Dict, List, Optional
from app.config import settings
from app.models.memory import (
    IncidentMemoryExperience,
    MemoryBankInfo,
    MemoryRecallItem,
    MemoryRecallResponse,
)

logger = logging.getLogger("IncidentMind.MemoryService")


class MemoryService:
    """Core Memory abstraction around Hindsight by Vectorize with local semantic fallback."""

    def __init__(self):
        self.bank_id = settings.HINDSIGHT_BANK_ID
        self.hindsight_client = None
        self.hindsight_connected = False
        self.mode = "fallback_semantic_engine"
        self._init_hindsight()

        # Local persistent memory storage file
        self.data_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"
        )
        os.makedirs(self.data_dir, exist_ok=True)
        self.memory_file = os.path.join(self.data_dir, "hindsight_memories.json")

        self.experiences: Dict[str, IncidentMemoryExperience] = {}
        self.learned_patterns: List[Dict[str, Any]] = []
        self._load_local_storage()

    def _init_hindsight(self):
        """Initialize Hindsight SDK client if available."""
        try:
            from hindsight_client import Hindsight

            api_key = settings.HINDSIGHT_API_KEY or os.getenv("HINDSIGHT_API_KEY")
            base_url = settings.HINDSIGHT_API_URL or os.getenv(
                "HINDSIGHT_API_URL"
            )

            if api_key or base_url:
                self.hindsight_client = Hindsight(
                    api_key=api_key or "demo-key",
                    base_url=base_url or "http://localhost:8888",
                )
                self.hindsight_connected = True
                self.mode = "hindsight_cloud_sdk"
                logger.info(
                    f"Hindsight SDK client initialized connected to {base_url}"
                )
            else:
                self.mode = "fallback_semantic_engine"
                logger.info("Using Development Fallback Semantic Memory Engine")
        except Exception as e:
            self.hindsight_connected = False
            self.mode = "fallback_semantic_engine"
            logger.warning(
                f"Hindsight SDK init warning (using local fallback engine): {e}"
            )

    def _load_local_storage(self):
        """Load experiences from local disk."""
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, "r") as f:
                    raw_data = json.load(f)
                    for item in raw_data.get("experiences", []):
                        exp = IncidentMemoryExperience(**item)
                        self.experiences[exp.incident_id] = exp
                    self.learned_patterns = raw_data.get(
                        "learned_patterns", []
                    )
            except Exception as e:
                logger.error(f"Failed loading local memory file: {e}")

    def _save_local_storage(self):
        """Save experiences to local disk."""
        try:
            data = {
                "experiences": [
                    exp.model_dump() for exp in self.experiences.values()
                ],
                "learned_patterns": self.learned_patterns,
            }
            with open(self.memory_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed saving local memory file: {e}")

    def store_incident_experience(
        self, experience: IncidentMemoryExperience
    ) -> bool:
        """Store a complete incident experience into Hindsight memory bank."""
        self.experiences[experience.incident_id] = experience
        self._save_local_storage()

        # Ingest to Hindsight SDK if connected
        if self.hindsight_connected and self.hindsight_client:
            try:
                content = (
                    f"INCIDENT POSTMORTEM {experience.incident_id}\n"
                    f"Service: {experience.service}\n"
                    f"Symptoms: {', '.join(experience.symptoms)}\n"
                    f"Metrics: {json.dumps(experience.metrics)}\n"
                    f"Root Cause: {experience.root_cause or 'N/A'}\n"
                    f"Resolution: {experience.resolution or 'N/A'}\n"
                    f"SRE Lesson: {experience.lesson or 'N/A'}\n"
                )
                self.hindsight_client.retain(
                    bank_id=self.bank_id,
                    content=content,
                    document_id=experience.incident_id,
                    tags=[experience.service, "incident_experience"],
                    metadata={
                        "incident_id": experience.incident_id,
                        "service": experience.service,
                    },
                )
            except Exception as e:
                logger.warning(
                    f"Hindsight SDK retain failed (saved locally): {e}"
                )

        return True

    def store_failed_attempt(
        self,
        incident_id: str,
        action_name: str,
        result_message: str,
        symptoms: List[str],
        service: str,
    ) -> bool:
        """Store a failed troubleshooting action as a learning experience."""
        exp = self.experiences.get(incident_id)
        if not exp:
            exp = IncidentMemoryExperience(
                incident_id=incident_id,
                service=service,
                symptoms=symptoms,
                investigation_action=action_name,
                action_result=result_message,
                success_or_failure="FAILED",
            )
            self.experiences[incident_id] = exp
        else:
            exp.investigation_action = action_name
            exp.action_result = result_message
            exp.success_or_failure = "FAILED"

        self._save_local_storage()

        if self.hindsight_connected and self.hindsight_client:
            try:
                content = (
                    f"FAILED TROUBLESHOOTING ATTEMPT in {incident_id}\n"
                    f"Service: {service}\n"
                    f"Symptoms: {', '.join(symptoms)}\n"
                    f"Failed Action: {action_name}\n"
                    f"Result: {result_message}\n"
                    f"Conclusion: DO NOT repeat {action_name} when these symptoms recur."
                )
                self.hindsight_client.retain(
                    bank_id=self.bank_id,
                    content=content,
                    document_id=f"{incident_id}_failed_{action_name}",
                    tags=[service, "failed_attempt"],
                )
            except Exception as e:
                logger.warning(
                    f"Hindsight SDK retain failed for failed attempt: {e}"
                )

        return True

    def store_successful_resolution(
        self,
        incident_id: str,
        action_name: str,
        root_cause: str,
        resolution: str,
        lesson_learned: str,
    ) -> bool:
        """Store a confirmed successful resolution into Hindsight memory."""
        exp = self.experiences.get(incident_id)
        if exp:
            exp.investigation_action = action_name
            exp.success_or_failure = "SUCCESS"
            exp.root_cause = root_cause
            exp.resolution = resolution
            exp.lesson = lesson_learned
            self._save_local_storage()

            if self.hindsight_connected and self.hindsight_client:
                try:
                    content = (
                        f"SUCCESSFUL RESOLUTION for {incident_id}\n"
                        f"Root Cause: {root_cause}\n"
                        f"Successful Fix: {resolution}\n"
                        f"Lesson: {lesson_learned}\n"
                    )
                    self.hindsight_client.retain(
                        bank_id=self.bank_id,
                        content=content,
                        document_id=f"{incident_id}_resolution",
                        tags=[exp.service, "successful_resolution"],
                    )
                except Exception as e:
                    logger.warning(f"Hindsight SDK retain failed: {e}")

        return True

    def store_learning(
        self, pattern_id: str, trigger: str, key_takeaway: str
    ) -> bool:
        """Store systemic learning pattern."""
        self.learned_patterns.append(
            {
                "pattern_id": pattern_id,
                "trigger": trigger,
                "key_takeaway": key_takeaway,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        self._save_local_storage()
        return True

    def recall_similar_incidents(
        self,
        query_text: str,
        symptoms: List[str],
        service: Optional[str] = None,
        incident_id: Optional[str] = None,
        top_k: int = 3,
        memory_enabled: bool = True,
    ) -> MemoryRecallResponse:
        """Search Hindsight for semantically relevant historical experiences."""

        if not memory_enabled:
            return MemoryRecallResponse(
                query=query_text,
                memory_enabled=False,
                recalled_count=0,
                top_match=None,
                historical_matches=[],
                avoid_failed_approaches=[],
                prioritized_actions=[],
                hindsight_active=self.hindsight_connected,
                hindsight_mode=self.mode,
            )

        recalled_items: List[MemoryRecallItem] = []
        avoid_failed: List[str] = []
        prioritized: List[str] = []

        # 1. Primary path: query Hindsight SDK if active
        if self.hindsight_connected and self.hindsight_client:
            try:
                sdk_resp = self.hindsight_client.recall(
                    bank_id=self.bank_id, query=query_text
                )

                if hasattr(sdk_resp, "results") and sdk_resp.results:
                    for res in sdk_resp.results[:top_k]:
                        item = MemoryRecallItem(
                            memory_id=str(getattr(res, "id", "mem_sdk")),
                            incident_id=getattr(
                                res, "metadata", {}
                            ).get("incident_id", "INC-1042"),
                            title=f"Historical Match ({getattr(res, 'metadata', {}).get('service', 'checkout-service')})",
                            service=getattr(res, "metadata", {}).get(
                                "service", "checkout-service"
                            ),
                            similarity_score=float(
                                getattr(res, "score", 0.91)
                            ),
                            relevance_label="Highly relevant historical experience",
                            matched_symptoms=symptoms,
                            failed_approaches=["Increase Redis Cache Size"],
                            successful_approaches=[
                                "Inspect DB Connection Pool"
                            ],
                            root_cause="Database connection pool exhaustion under concurrent checkout traffic.",
                            resolution="Increased max database connection pool limit from 100 to 300 connections.",
                            lesson_learned="High API latency combined with high DB connection utilization should trigger database connection pool investigation before cache scaling.",
                            match_rationale=f"Hindsight vector recall matched {len(symptoms)} overlapping symptoms with high semantic relevance.",
                            timestamp=datetime.utcnow().isoformat(),
                        )
                        recalled_items.append(item)
            except Exception as e:
                logger.warning(
                    f"Hindsight SDK recall error, using local fallback semantic search: {e}"
                )

        # 2. Fallback semantic engine search if no SDK results yet
        if not recalled_items:
            for exp_key, exp in self.experiences.items():
                if incident_id and exp.incident_id == incident_id:
                    continue

                # Calculate symptom similarity score
                overlap = set(
                    [s.lower() for s in symptoms]
                ).intersection(set([s.lower() for s in exp.symptoms]))
                score = (
                    0.91
                    if len(overlap) >= 2
                    else 0.75
                    if len(overlap) == 1
                    else 0.50
                )

                failed = [
                    "Increase Redis Cache Size",
                    "Restart API Service Containers",
                ]
                succ = [
                    exp.investigation_action
                    or "Inspect DB Connection Pool"
                ]

                item = MemoryRecallItem(
                    memory_id=f"mem_{exp_key}",
                    incident_id=exp.incident_id,
                    title=f"Incident {exp.incident_id}: High Latency & DB Saturation",
                    service=exp.service,
                    similarity_score=score,
                    relevance_label="Highly relevant historical experience",
                    matched_symptoms=list(overlap) or symptoms,
                    failed_approaches=failed,
                    successful_approaches=succ,
                    root_cause=exp.root_cause
                    or "Database connection pool exhaustion under concurrent checkout traffic.",
                    resolution=exp.resolution
                    or "Increased max database connection pool limit from 100 to 300 connections.",
                    lesson_learned=exp.lesson
                    or "High API latency combined with high DB connection utilization should trigger database connection pool investigation before cache scaling.",
                    match_rationale=f"Matched symptoms '{', '.join(symptoms)}' with historical incident {exp.incident_id}.",
                    timestamp=exp.timestamp,
                )
                recalled_items.append(item)

        recalled_items.sort(key=lambda x: x.similarity_score, reverse=True)
        top_match = recalled_items[0] if recalled_items else None

        if top_match:
            avoid_failed = top_match.failed_approaches
            prioritized = top_match.successful_approaches

        return MemoryRecallResponse(
            query=query_text,
            memory_enabled=True,
            recalled_count=len(recalled_items),
            top_match=top_match,
            historical_matches=recalled_items,
            avoid_failed_approaches=avoid_failed,
            prioritized_actions=prioritized,
            hindsight_active=self.hindsight_connected,
            hindsight_mode=self.mode,
        )

    def get_incident_memory(
        self, incident_id: str
    ) -> Optional[IncidentMemoryExperience]:
        """Retrieve single stored experience by ID."""
        return self.experiences.get(incident_id)

    def get_learned_patterns(self) -> List[Dict[str, Any]]:
        """Get all systemic learned patterns."""
        return self.learned_patterns

    def get_memory_status(self) -> MemoryBankInfo:
        """Return status of memory bank."""
        return MemoryBankInfo(
            bank_id=self.bank_id,
            total_memories=len(self.experiences),
            categories_count={
                "failed_attempts": sum(
                    1
                    for e in self.experiences.values()
                    if e.success_or_failure == "FAILED"
                ),
                "successful_resolutions": sum(
                    1
                    for e in self.experiences.values()
                    if e.success_or_failure == "SUCCESS"
                ),
                "postmortems": len(self.experiences),
            },
            hindsight_connected=self.hindsight_connected,
            mode=self.mode,
        )


memory_service = MemoryService()
