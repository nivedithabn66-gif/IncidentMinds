import json
import logging
import os
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.incident import Incident, ActionAttempt, IncidentTimelineEvent
from app.models.memory import IncidentMemoryExperience
from app.services.memory_service import memory_service
from app.utils.seed_data import generate_seed_incidents

logger = logging.getLogger("IncidentMind.IncidentService")

class IncidentService:
    """Manages active incidents, investigation actions, timeline audit trails, and memory integration."""

    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "incidents")
        os.makedirs(self.data_dir, exist_ok=True)
        self.filepath = os.path.join(self.data_dir, "incidents.json")
        self.incidents: Dict[str, Incident] = {}
        self._load_or_seed_incidents()

    def _load_or_seed_incidents(self):
        """Load incidents from disk or seed default dataset."""
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r') as f:
                    raw_data = json.load(f)
                    for item in raw_data:
                        inc = Incident(**item)
                        self.incidents[inc.incident_id] = inc
                logger.info(f"Loaded {len(self.incidents)} incidents from disk.")
                return
            except Exception as e:
                logger.error(f"Error loading incidents from file, re-seeding: {e}")

        # Seed initial incidents
        seed_list = generate_seed_incidents()
        for inc in seed_list:
            self.incidents[inc.incident_id] = inc
            # Populate Hindsight memory with historical INC-1042 experience
            if inc.incident_id == "INC-1042":
                exp = IncidentMemoryExperience(
                    incident_id=inc.incident_id,
                    service=inc.service,
                    incident_type="database_connection_exhaustion",
                    symptoms=inc.symptoms,
                    metrics=inc.metrics,
                    recent_changes=["Deployed v2.4.0 checkout service"],
                    investigation_action="Inspect DB Connection Pool",
                    action_result="Found DB connection pool utilization at 98%. Scaled pool size to 300.",
                    success_or_failure="SUCCESS",
                    root_cause=inc.root_cause or "Database connection pool exhaustion under high concurrent load.",
                    resolution=inc.resolution or "Expanded database pool limit from 100 to 300 connections.",
                    lesson=inc.lesson_learned or "High API latency combined with high DB connection utilization should trigger database pool inspection before cache scaling.",
                    timestamp=inc.timestamp
                )
                memory_service.store_incident_experience(exp)
            elif inc.incident_id == "INC-1011":
                exp = IncidentMemoryExperience(
                    incident_id=inc.incident_id,
                    service=inc.service,
                    incident_type="jwt_secret_rotation_failure",
                    symptoms=inc.symptoms,
                    metrics=inc.metrics,
                    recent_changes=["Rotated auth signing secrets in Kubernetes secret vault"],
                    investigation_action="Inspect Auth JWT Keys & Secret Rotation",
                    action_result="Synchronized RS256 public key secret across auth gateway pods.",
                    success_or_failure="SUCCESS",
                    root_cause=inc.root_cause or "Kubernetes secret vault failed to distribute rotated RS256 public key to auth-gateway replicas.",
                    resolution=inc.resolution or "Applied force sync on auth-vault secrets operator.",
                    lesson=inc.lesson_learned or "HTTP 401 authorization spikes following secret deployment indicate key sync mismatch, not pod replica exhaustion.",
                    timestamp=inc.timestamp
                )
                memory_service.store_incident_experience(exp)

        self._save_incidents()

    def _save_incidents(self):
        """Save incidents to JSON file."""
        try:
            data = [inc.model_dump() for inc in self.incidents.values()]
            with open(self.filepath, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save incidents: {e}")

    def list_incidents(self) -> List[Incident]:
        """Return list of all incidents."""
        return list(self.incidents.values())

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        """Get incident by ID."""
        return self.incidents.get(incident_id)

    def update_incident_status(self, incident_id: str, status: str) -> Optional[Incident]:
        """Update incident status."""
        inc = self.incidents.get(incident_id)
        if inc:
            inc.status = status
            inc.timeline.append(IncidentTimelineEvent(
                event_type="status_change",
                title=f"Incident Status: {status.upper()}",
                description=f"Incident status changed to {status}.",
                metadata={"status": status}
            ))
            self._save_incidents()
        return inc

    def execute_action(self, incident_id: str, action_id: str, action_name: str) -> Dict[str, Any]:
        """Execute a simulated SRE investigation action."""
        inc = self.incidents.get(incident_id)
        if not inc:
            raise ValueError(f"Incident {incident_id} not found")

        timestamp = datetime.utcnow().isoformat()
        is_success = False
        result_message = ""
        reason = ""

        # Determine outcome based on action type
        if action_id == "increase_cache":
            is_success = False
            result_message = "Cache hit ratio remained at 94.2%. API latency unchanged at 5.1s. DB connections remain saturated at 96%."
            reason = "Root cause is database connection pool exhaustion, not cache capacity."
            
            attempt = ActionAttempt(
                action_id=action_id,
                action_name=action_name,
                executed_at=timestamp,
                status="FAILED",
                result_message=result_message,
                reason=reason
            )
            inc.failed_attempts.append(attempt)
            
            # Store failed attempt in Hindsight Memory
            memory_service.store_failed_attempt(
                incident_id=incident_id,
                action_name=action_name,
                result_message=result_message,
                symptoms=inc.symptoms,
                service=inc.service
            )

        elif action_id == "check_db_pool":
            is_success = True
            result_message = "CRITICAL: Database connection pool is 96% utilized (96/100 active connections in checkout-db-pool)."
            reason = "Connection pool exhaustion confirmed as primary bottleneck."
            
            attempt = ActionAttempt(
                action_id=action_id,
                action_name=action_name,
                executed_at=timestamp,
                status="SUCCESS",
                result_message=result_message,
                reason=reason
            )
            inc.successful_actions.append(attempt)

        elif action_id == "restart_service":
            is_success = False
            result_message = "Service restarted successfully. API latency dropped for 45 seconds, then returned to 5.1s as DB connections re-exhausted."
            reason = "Service restart provides temporary relief but does not fix connection pool bottleneck."
            
            attempt = ActionAttempt(
                action_id=action_id,
                action_name=action_name,
                executed_at=timestamp,
                status="FAILED",
                result_message=result_message,
                reason=reason
            )
            inc.failed_attempts.append(attempt)
            memory_service.store_failed_attempt(
                incident_id=incident_id,
                action_name=action_name,
                result_message=result_message,
                symptoms=inc.symptoms,
                service=inc.service
            )

        else:
            is_success = True
            result_message = f"Diagnostic action '{action_name}' executed. Telemetry captured."
            reason = "Normal telemetry baseline."
            attempt = ActionAttempt(
                action_id=action_id,
                action_name=action_name,
                executed_at=timestamp,
                status="SUCCESS",
                result_message=result_message,
                reason=reason
            )
            inc.successful_actions.append(attempt)

        # Update Timeline
        inc.timeline.append(IncidentTimelineEvent(
            event_type="action",
            title=f"Action Executed: {action_name}",
            description=result_message,
            metadata={
                "action_id": action_id,
                "status": "SUCCESS" if is_success else "FAILED",
                "reason": reason
            }
        ))

        self._save_incidents()

        return {
            "incident_id": incident_id,
            "action_id": action_id,
            "action_name": action_name,
            "status": "SUCCESS" if is_success else "FAILED",
            "result_message": result_message,
            "reason": reason
        }

    def resolve_incident(
        self,
        incident_id: str,
        root_cause: str,
        resolution: str,
        lesson_learned: str
    ) -> Incident:
        """Resolve incident and retain experience in Hindsight long-term memory."""
        inc = self.incidents.get(incident_id)
        if not inc:
            raise ValueError(f"Incident {incident_id} not found")

        inc.status = "resolved"
        inc.root_cause = root_cause
        inc.resolution = resolution
        inc.lesson_learned = lesson_learned

        # Update metrics to resolved normal baseline
        inc.metrics["latency_sec"] = 0.18
        inc.metrics["db_conn_pct"] = 28
        inc.metrics["error_rate_pct"] = 0.01

        inc.timeline.append(IncidentTimelineEvent(
            event_type="resolution",
            title="Incident Resolved & Memory Retained",
            description=f"Root cause confirmed: {root_cause}. Resolution applied: {resolution}. Experience stored in Hindsight.",
            metadata={"status": "resolved"}
        ))

        # Build complete experience object and store in Hindsight
        experience = IncidentMemoryExperience(
            incident_id=inc.incident_id,
            service=inc.service,
            incident_type="database_connection_exhaustion",
            symptoms=inc.symptoms,
            metrics=inc.metrics,
            recent_changes=["Resolved database pool bottleneck"],
            investigation_action=inc.successful_actions[-1].action_name if inc.successful_actions else "Inspect DB Connection Pool",
            action_result="DB Connection Pool limit expanded to 300 connections. Latency normalized.",
            success_or_failure="SUCCESS",
            root_cause=root_cause,
            resolution=resolution,
            lesson=lesson_learned,
            timestamp=datetime.utcnow().isoformat()
        )

        memory_service.store_incident_experience(experience)
        memory_service.store_successful_resolution(
            incident_id=incident_id,
            action_name=experience.investigation_action or "Inspect DB Connection Pool",
            root_cause=root_cause,
            resolution=resolution,
            lesson_learned=lesson_learned
        )

        from app.services.incident_reasoning_service import reasoning_service
        reasoning_service.generate_and_store_lesson(
            incident=inc,
            root_cause=root_cause,
            resolution=resolution,
            lesson_learned=lesson_learned
        )

        self._save_incidents()
        return inc

    def create_incident(self, data: Any) -> Incident:
        import uuid
        inc_id = f"INC-{uuid.uuid4().hex[:4].upper()}"
        inc = Incident(
            incident_id=inc_id,
            title=data.title,
            severity=data.severity,
            service=data.service,
            timestamp=datetime.utcnow().isoformat(),
            status="active",
            symptoms=data.symptoms,
            metrics=data.metrics,
            logs=data.logs,
            recent_changes=data.recent_changes,
            possible_causes=["Database connection pool exhaustion", "Upstream API timeout", "Cache capacity limit"],
            timeline=[
                IncidentTimelineEvent(
                    event_type="detection",
                    title="Incident Triggered by Simulator",
                    description=f"Automated alert triggered for {data.service}.",
                    metadata={"severity": data.severity}
                )
            ]
        )
        self.incidents[inc.incident_id] = inc
        self._save_incidents()
        return inc

    def reset_demo(self) -> Dict[str, Any]:
        """Reset incidents and memory back to clean hackathon demo state."""
        if os.path.exists(self.filepath):
            try:
                os.remove(self.filepath)
            except Exception:
                pass

        self.incidents = {}
        self._load_or_seed_incidents()
        return {"status": "SUCCESS", "message": "Demo state reset successfully."}

incident_service = IncidentService()
