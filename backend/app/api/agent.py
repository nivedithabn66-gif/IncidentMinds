from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from app.services.incident_service import incident_service
from app.services.agent_service import agent_service

router = APIRouter()

@router.post("/incidents/{incident_id}/investigate", response_model=Dict[str, Any])
async def investigate_incident(
    incident_id: str,
    memory_enabled: bool = Query(True, description="Toggle Hindsight memory context ON or OFF")
):
    """Trigger SRE Agent memory-aware investigation for a given incident."""
    incident = incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    result = agent_service.investigate_incident(incident, memory_enabled=memory_enabled)
    incident_service.update_incident_status(incident_id, "investigating")
    return result

@router.post("/incidents/{incident_id}/experiment", response_model=Dict[str, Any])
async def run_memory_experiment(incident_id: str):
    """
    Run side-by-side Memory OFF vs Memory ON experiment for a fixed incident (Section 13).
    Returns comparative assessment, recommendation changes, and memory influence score.
    """
    incident = incident_service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    return agent_service.run_memory_experiment(incident)
