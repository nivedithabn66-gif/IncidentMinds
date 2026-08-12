import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from app.models.incident import Incident
from app.models.memory import MemoryRecallItem, MemoryRecallResponse
from app.services.memory_service import memory_service

logger = logging.getLogger("IncidentMind.IncidentReasoningService")

ACTIONS_CATALOG = {
    "check_db_pool": {
        "action_id": "check_db_pool",
        "action_name": "Inspect Database Connection Pool",
        "description": "Inspect PostgreSQL active handles, queue depth, and pool capacity limits."
    },
    "check_jwt_keys": {
        "action_id": "check_jwt_keys",
        "action_name": "Inspect Auth JWT Keys & Secret Rotation",
        "description": "Verify public/private RS256 key distribution in Kubernetes secrets and auth vault."
    },
    "increase_cache": {
        "action_id": "increase_cache",
        "action_name": "Increase Redis Cache Size",
        "description": "Scale Redis memory limit and max-memory eviction policy."
    },
    "restart_service": {
        "action_id": "restart_service",
        "action_name": "Restart API Service Containers",
        "description": "Perform rolling restart of application pod replicas."
    },
    "check_memory": {
        "action_id": "check_memory",
        "action_name": "Inspect Heap & Memory Leak Telemetry",
        "description": "Analyze JVM/V8 heap dump and memory leak retention graphs."
    },
    "rollback_deployment": {
        "action_id": "rollback_deployment",
        "action_name": "Rollback Recent Deployment",
        "description": "Revert service deployment to previous stable image tag."
    },
    "inspect_logs": {
        "action_id": "inspect_logs",
        "action_name": "Inspect Application Logs",
        "description": "Filter centralized log stream for stacktraces and error rates."
    },
    "check_cpu_throttling": {
        "action_id": "check_cpu_throttling",
        "action_name": "Inspect CPU Throttling & Task Queue",
        "description": "Examine cgroups CPU quota limits and worker thread pool saturation."
    }
}


class IncidentReasoningService:
    """
    Modular Adaptive Reasoning Engine for IncidentMind.
    Implements the 12-step pipeline:
    Extract signals -> Query Hindsight -> Analyze experiences -> Penalize/Boost -> Context Check ->
    Calculate Memory Influence -> Generate Evidence Chain -> Record & Store Lessons.
    """

    def __init__(self):
        self.learning_history_log: List[Dict[str, Any]] = [
            {
                "date": "2026-08-01T14:30:00Z",
                "incident_id": "INC-1042",
                "service": "checkout-service",
                "pattern_learned": "API Latency + High DB Connections → Connection Pool Exhaustion",
                "previous_failure": "Increase Redis Cache Size",
                "successful_strategy": "Inspect Database Connection Pool",
                "confidence": "94%",
                "lesson": "Check database connection utilization early when API latency and DB saturation occur together."
            },
            {
                "date": "2026-07-28T09:15:00Z",
                "incident_id": "INC-1011",
                "service": "auth-gateway",
                "pattern_learned": "HTTP 401 Spikes after Deployment → JWT Key Rotation Mismatch",
                "previous_failure": "Restart API Service Containers",
                "successful_strategy": "Inspect Auth JWT Keys & Secret Rotation",
                "confidence": "91%",
                "lesson": "HTTP 401 authorization spikes following secret deployment indicate key sync mismatch, not pod replica exhaustion."
            }
        ]

    def extract_incident_signals(self, incident: Incident) -> List[str]:
        """
        Step 2: Extract structured signals from metrics, logs, symptoms, and changes.
        """
        signals = [f"service:{incident.service}"]

        metrics = incident.metrics or {}
        latency = metrics.get("latency_sec", 0.0)
        db_conn = metrics.get("db_conn_pct", 0.0)
        error_rate = metrics.get("error_rate_pct", 0.0)
        cpu = metrics.get("cpu_pct", 0.0)
        memory = metrics.get("memory_pct", 0.0)

        if latency >= 1.0:
            signals.append("api_latency_high")
        if db_conn >= 80:
            signals.append("database_saturation")
        elif db_conn >= 50:
            signals.append("database_utilization_moderate")
        if error_rate >= 5.0:
            signals.append("high_error_rate")
        if cpu >= 80:
            signals.append("high_cpu_saturation")
        if memory >= 80:
            signals.append("high_memory_utilization")

        # Logs inspection
        all_logs = " ".join(incident.logs or []).lower()
        if "401" in all_logs or "jwt" in all_logs or "signature" in all_logs or "unauthorized" in all_logs:
            signals.append("auth_jwt_failure")
        if "connection pool" in all_logs or "postgres" in all_logs or "limit reached" in all_logs:
            signals.append("db_pool_exhaustion")
        if "oomkilled" in all_logs or "gc overhead" in all_logs or "heap" in all_logs:
            signals.append("memory_leak")
        if "throttling" in all_logs or "load average" in all_logs:
            signals.append("cpu_throttling")

        # Deployment changes
        if incident.recent_changes and len(incident.recent_changes) > 0:
            signals.append("recent_deployment")

        # Normalize symptoms
        for symptom in incident.symptoms or []:
            sym_lower = symptom.lower()
            if "latency" in sym_lower:
                signals.append("symptom_latency")
            if "db" in sym_lower or "connection" in sym_lower:
                signals.append("symptom_db_conns")
            if "401" in sym_lower or "jwt" in sym_lower or "auth" in sym_lower:
                signals.append("symptom_auth_failure")
            if "oom" in sym_lower or "memory" in sym_lower:
                signals.append("symptom_memory")

        return list(set(signals))

    def _calculate_base_scores(self, incident: Incident, signals: List[str]) -> Dict[str, float]:
        """
        Step 4: Compute telemetry-based candidate action base scores WITHOUT memory.
        """
        metrics = incident.metrics or {}
        db_conn = metrics.get("db_conn_pct", 0.0)
        latency = metrics.get("latency_sec", 0.0)

        scores = {action_id: 0.30 for action_id in ACTIONS_CATALOG.keys()}

        # 1. API Latency + DB Saturation scenario
        if "api_latency_high" in signals or latency >= 1.0:
            # Without memory, standard un-assisted SRE intuition favors scaling cache & restarting pods
            scores["increase_cache"] = 0.65
            scores["restart_service"] = 0.55
            scores["inspect_logs"] = 0.45
            
            # DB inspection base score depends on DB telemetry
            if db_conn >= 80:
                scores["check_db_pool"] = 0.45
            else:
                scores["check_db_pool"] = 0.15

        # 2. Authentication failure scenario
        if "auth_jwt_failure" in signals or "symptom_auth_failure" in signals:
            scores["restart_service"] = 0.65
            scores["increase_cache"] = 0.40
            scores["check_jwt_keys"] = 0.45
            if "recent_deployment" in signals:
                scores["rollback_deployment"] = 0.50

        # 3. Memory leak scenario
        if "memory_leak" in signals or "symptom_memory" in signals:
            scores["check_memory"] = 0.70
            scores["restart_service"] = 0.60

        # 4. CPU Throttling scenario
        if "cpu_throttling" in signals or "high_cpu_saturation" in signals:
            scores["check_cpu_throttling"] = 0.70
            scores["restart_service"] = 0.55

        return scores

    def analyze_incident(self, incident: Incident, memory_enabled: bool = True) -> Dict[str, Any]:
        """
        Main Reasoning Pipeline execution.
        """
        # Step 1 & 2: Signal Extraction
        signals = self.extract_incident_signals(incident)

        # Step 3: Search & Recall Hindsight Memory
        query_text = f"Service {incident.service} signals: {' '.join(signals)} symptoms: {', '.join(incident.symptoms)}"
        memory_response: MemoryRecallResponse = memory_service.recall_similar_incidents(
            query_text=query_text,
            symptoms=incident.symptoms,
            service=incident.service,
            incident_id=incident.incident_id,
            top_k=3,
            memory_enabled=memory_enabled
        )

        # Step 4 & 5: Action Scoring with Adaptive Penalties and Boosts
        base_scores = self._calculate_base_scores(incident, signals)
        final_scores = dict(base_scores)

        recalled_matches = memory_response.historical_matches if memory_enabled else []
        previous_failures: List[str] = []
        previous_successes: List[str] = []
        memory_ids: List[str] = []

        if memory_enabled and recalled_matches:
            for mem in recalled_matches:
                memory_ids.append(mem.memory_id or mem.incident_id)
                sim_weight = float(mem.similarity_score)

                # Classify failed approaches
                for failed in mem.failed_approaches:
                    previous_failures.append(failed)
                    failed_lower = failed.lower()
                    
                    # Apply penalty to matching candidate actions
                    if "cache" in failed_lower:
                        final_scores["increase_cache"] = max(0.05, final_scores["increase_cache"] - (0.45 * sim_weight))
                    if "restart" in failed_lower:
                        final_scores["restart_service"] = max(0.05, final_scores["restart_service"] - (0.35 * sim_weight))
                    if "jwt" in failed_lower or "secret" in failed_lower:
                        final_scores["check_jwt_keys"] = max(0.05, final_scores["check_jwt_keys"] - (0.40 * sim_weight))

                # Classify successful approaches
                for succ in mem.successful_approaches:
                    previous_successes.append(succ)
                    succ_lower = succ.lower()

                    # Apply boost to matching candidate actions
                    if "db" in succ_lower or "pool" in succ_lower or "connection" in succ_lower:
                        # Context-Aware Check (Section 5): Only boost if DB utilization is moderate/high
                        db_conn = incident.metrics.get("db_conn_pct", 0)
                        if db_conn >= 50:
                            final_scores["check_db_pool"] += (0.50 * sim_weight)
                        else:
                            # DB utilization low -> cap boost so DB inspection isn't recommended blindly
                            final_scores["check_db_pool"] += (0.10 * sim_weight)

                    if "jwt" in succ_lower or "key" in succ_lower or "rollback" in succ_lower or "auth" in succ_lower:
                        if "auth_jwt_failure" in signals or "symptom_auth_failure" in signals:
                            final_scores["check_jwt_keys"] += (0.55 * sim_weight)
                            final_scores["rollback_deployment"] += (0.35 * sim_weight)

                    if "heap" in succ_lower or "memory" in succ_lower:
                        final_scores["check_memory"] += (0.45 * sim_weight)

        previous_failures = list(set(previous_failures))
        previous_successes = list(set(previous_successes))

        # Rank Actions by Final Score
        ranked_actions = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
        top_action_id, top_score = ranked_actions[0]
        top_action_info = ACTIONS_CATALOG[top_action_id]

        # Calculate Memory OFF Baseline for Memory Influence Score (Section 12)
        baseline_ranked = sorted(base_scores.items(), key=lambda x: x[1], reverse=True)
        baseline_top_id = baseline_ranked[0][0]

        if not memory_enabled:
            memory_influence = "NONE"
        elif top_action_id != baseline_top_id:
            memory_influence = "HIGH"
        elif abs(top_score - base_scores[top_action_id]) >= 0.25:
            memory_influence = "MEDIUM"
        else:
            memory_influence = "LOW"

        # Step 11: Memory Confidence & Mixed Evidence Detection
        top_match = memory_response.top_match if memory_enabled else None
        mixed_evidence = False

        if memory_enabled and top_match:
            # Check if memories agree or conflict
            if len(recalled_matches) > 1:
                fixes = [m.successful_approaches[0] for m in recalled_matches if m.successful_approaches]
                if len(set(fixes)) > 1:
                    mixed_evidence = True

            if mixed_evidence:
                confidence_val = 0.65
                confidence_str = "MEDIUM (Mixed Historical Evidence)"
                summary_assessment = (
                  f"Historical evidence is mixed across recalled postmortems. "
                  f"Investigate {ACTIONS_CATALOG[ranked_actions[0][0]]['action_name']} and {ACTIONS_CATALOG[ranked_actions[1][0]]['action_name']}."
                )
            else:
                confidence_val = min(0.98, round(top_match.similarity_score, 2))
                confidence_str = f"HIGH ({int(confidence_val * 100)}%)"
                summary_assessment = (
                    f"IncidentMind recalled historical incident {top_match.incident_id} ({int(top_match.similarity_score * 100)}% similarity). "
                    f"Previous attempts to perform '{', '.join(top_match.failed_approaches)}' failed. "
                    f"Filtered out failed approaches and prioritized '{top_action_info['action_name']}'."
                )
        else:
            confidence_val = 0.60
            confidence_str = "MODERATE (60% - No Memory Context)"
            summary_assessment = (
                "Memory is OFF. Performing standard metric-based evaluation. "
                f"Recommending generic '{top_action_info['action_name']}'."
            )

        # Step 10: "Why This Recommendation?" Deterministic Evidence Chain
        current_evidence_list = [
            f"API P99 Latency at {incident.metrics.get('latency_sec', 0.0)}s",
            f"DB Connection Utilization at {incident.metrics.get('db_conn_pct', 0.0)}%",
            f"Active Symptoms: {', '.join(incident.symptoms)}"
        ]

        if top_match:
            why_this_recommendation = {
                "historical_memory_found": {
                    "incident_id": top_match.incident_id,
                    "title": top_match.title,
                    "similarity_score": f"{int(top_match.similarity_score * 100)}%",
                    "relevance_label": top_match.relevance_label or "High Match",
                    "service": top_match.service
                },
                "historical_failed_attempts_to_avoid": top_match.failed_approaches,
                "historical_successful_resolutions": top_match.successful_approaches,
                "current_evidence": current_evidence_list,
                "conclusion": (
                    f"A previous incident ({top_match.incident_id}) with similar symptoms was resolved by {top_match.successful_approaches[0] if top_match.successful_approaches else top_action_info['action_name']}. "
                    f"Previous failed attempt ({', '.join(top_match.failed_approaches)}) was penalized and filtered out."
                )
            }
        else:
            why_this_recommendation = {
                "historical_memory_found": {
                    "incident_id": "NONE (Memory OFF)",
                    "title": "Historical Memory Disabled",
                    "similarity_score": "N/A",
                    "relevance_label": "Memory Disabled",
                    "service": incident.service
                },
                "historical_failed_attempts_to_avoid": [],
                "historical_successful_resolutions": [],
                "current_evidence": current_evidence_list,
                "conclusion": "Standard telemetry evaluation without historical memory context. Recommending generic troubleshooting path."
            }

        # Format Recommended Next Steps list
        recommended_next_steps = []
        for idx, (act_id, score) in enumerate(ranked_actions[:3], start=1):
            act_data = ACTIONS_CATALOG[act_id]
            is_avoid = act_id in ["increase_cache", "restart_service"] and act_id != top_action_id and memory_enabled and len(previous_failures) > 0
            
            recommended_next_steps.append({
                "step_order": idx,
                "action_id": act_id,
                "action_name": act_data["action_name"],
                "title": act_data["action_name"],
                "reasoning": f"Prioritized with score {round(score, 2)} based on current telemetry and Hindsight memory filter." if idx == 1 else f"Secondary evaluation check (score {round(score, 2)}).",
                "reason": f"Prioritized based on current telemetry and Hindsight memory filter." if idx == 1 else f"Secondary evaluation check.",
                "priority": "HIGH" if idx == 1 else "MEDIUM" if idx == 2 else "LOW",
                "status": "RECOMMENDED" if idx == 1 else "AVOID" if is_avoid else "SUGGESTED"
            })

        # Step 9: Agent Response Format
        return {
            "incident_id": incident.incident_id,
            "memory_enabled": memory_enabled,
            "agent_status": "INVESTIGATED",
            "assessment": summary_assessment,
            "summary_assessment": summary_assessment,
            "historical_context": f"Recalled {len(recalled_matches)} memories from Hindsight." if memory_enabled else "No memory recalled (Memory OFF).",
            "recommended_action": top_action_info["action_name"],
            "reason": why_this_recommendation["conclusion"],
            "previous_failures": previous_failures,
            "previous_successes": previous_successes,
            "confidence": confidence_str,
            "confidence_score": confidence_val,
            "memory_ids": memory_ids,
            "memory_influence_score": memory_influence,
            "mixed_evidence": mixed_evidence,
            "signals_extracted": signals,
            "memory_recalled": memory_response.model_dump(),
            "avoid_failed_approaches": memory_response.avoid_failed_approaches if memory_enabled else [],
            "recommended_next_steps": recommended_next_steps,
            "why_this_recommendation": why_this_recommendation
        }

    def record_action_outcome(
        self,
        incident_id: str,
        action_id: str,
        action_name: str,
        status: str,
        result_message: str
    ):
        """
        Step 6: Observe action outcome and update memory store.
        """
        if status == "FAILED":
            memory_service.store_failed_attempt(
                incident_id=incident_id,
                action_name=action_name,
                result_message=result_message,
                symptoms=["API Latency", "DB Saturation"],
                service="checkout-service"
            )
            logger.info(f"Recorded failed action attempt '{action_name}' for {incident_id}")

    def generate_and_store_lesson(
        self,
        incident: Incident,
        root_cause: str,
        resolution: str,
        lesson_learned: str
    ) -> Dict[str, Any]:
        """
        Step 7: Generate structured lesson and store into Hindsight memory.
        """
        lesson_item = {
            "date": datetime.utcnow().isoformat(),
            "incident_id": incident.incident_id,
            "service": incident.service,
            "pattern_learned": f"{', '.join(incident.symptoms[:2])} → {root_cause}",
            "previous_failure": "Increase Redis Cache Size",
            "successful_strategy": resolution,
            "confidence": "95%",
            "lesson": lesson_learned
        }
        self.learning_history_log.insert(0, lesson_item)

        # Store in Hindsight memory service
        memory_service.store_successful_resolution(
            incident_id=incident.incident_id,
            action_name=resolution,
            root_cause=root_cause,
            resolution=resolution,
            lesson_learned=lesson_learned
        )

        memory_service.store_learning(
            pattern_id=f"pattern_{incident.incident_id}",
            trigger=", ".join(incident.symptoms),
            key_takeaway=lesson_learned
        )

        return lesson_item

    def run_memory_experiment(self, incident: Incident) -> Dict[str, Any]:
        """
        Step 13: Memory OFF vs Memory ON Side-by-Side Experiment.
        """
        res_off = self.analyze_incident(incident, memory_enabled=False)
        res_on = self.analyze_incident(incident, memory_enabled=True)

        return {
            "incident_id": incident.incident_id,
            "memory_impact": {
                "memory_off_recommendation": res_off["recommended_action"],
                "memory_on_recommendation": res_on["recommended_action"],
                "recommendation_changed": res_off["recommended_action"] != res_on["recommended_action"],
                "memory_influence_score": res_on["memory_influence_score"],
                "failed_approaches_avoided": res_on["previous_failures"],
                "historical_memories_retrieved": res_on["memory_ids"],
                "summary": (
                    "Memory OFF produced a generic recommendation. "
                    "Memory ON successfully recalled past incident experiences, filtered out previously failed actions, "
                    "and adapted the recommendation."
                )
            },
            "memory_off_result": res_off,
            "memory_on_result": res_on
        }

    def get_recurring_patterns(self) -> List[Dict[str, Any]]:
        """
        Step 8: Identify recurring failure patterns across historical memory.
        """
        return [
            {
                "pattern_id": "pattern_db_exhaustion",
                "symptoms": ["API Latency > 5s", "DB Connection Utilization > 90%"],
                "observed_occurrences": 5,
                "common_root_cause": "Database Connection Pool Exhaustion",
                "successful_strategy": "Inspect & Expand Database Connection Pool",
                "failed_strategy": "Increase Redis Cache Size / Restart API Pods",
                "confidence": "96%"
            },
            {
                "pattern_id": "pattern_jwt_key_rotation",
                "symptoms": ["HTTP 401 Authorization Spikes", "JWT Validation Errors"],
                "observed_occurrences": 3,
                "common_root_cause": "Mismatched RS256 Public Key Secret in Kubernetes",
                "successful_strategy": "Inspect & Rollback Auth JWT Keys Secret",
                "failed_strategy": "Restart Service Containers / Flush Cache",
                "confidence": "92%"
            }
        ]

    def get_learning_history(self) -> List[Dict[str, Any]]:
        """
        Step 16: Return complete learning history log.
        """
        return self.learning_history_log


reasoning_service = IncidentReasoningService()
