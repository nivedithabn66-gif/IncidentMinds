import logging
from typing import Dict, Any, List
from app.models.incident import Incident
from app.services.incident_reasoning_service import reasoning_service

logger = logging.getLogger("IncidentMind.AgentService")

class SREAgentService:
    """AI SRE reasoning layer delegating to IncidentReasoningService."""

    def investigate_incident(self, incident: Incident, memory_enabled: bool = True) -> Dict[str, Any]:
        """
        Analyze current incident using the adaptive reasoning pipeline.
        """
        return reasoning_service.analyze_incident(incident, memory_enabled=memory_enabled)

    def run_memory_experiment(self, incident: Incident) -> Dict[str, Any]:
        """
        Run Memory OFF vs Memory ON side-by-side benchmark experiment.
        """
        return reasoning_service.run_memory_experiment(incident)

agent_service = SREAgentService()
