from fastapi import APIRouter, HTTPException, Path
from typing import List, Dict, Any
from app.models.incident import ActionRequest, ResolutionRequest
from app.services.incident_service import incident_service

router = APIRouter()

@router.get("/incidents")
async def list_incidents():
    """List all active, investigating, and resolved incidents."""
    return incident_service.list_incidents()

@router.post("/incidents")
async def create_incident(req: Any):
    """Create a new simulated incident."""
    from app.models.incident import IncidentCreate
    create_data = IncidentCreate(**req)
    return incident_service.create_incident(create_data)

@router.get("/incidents/{incident_id}")
async def get_incident(incident_id: str = Path(..., description="The ID of the incident")):
    """Get detailed information for a specific incident."""
    inc = incident_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    return inc

@router.post("/incidents/reset")
async def reset_demo_data():
    """Reset incidents database to initial demo state."""
    return incident_service.reset_demo()

@router.post("/incidents/{incident_id}/action")
async def execute_action(incident_id: str, req: ActionRequest):
    """Simulate an SRE troubleshooting action on an incident."""
    try:
        res = incident_service.execute_action(
            incident_id=incident_id,
            action_id=req.action_id,
            action_name=req.action_name
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed executing action: {str(e)}")

@router.post("/incidents/{incident_id}/resolve")
async def resolve_incident(incident_id: str, req: ResolutionRequest):
    """Mark incident as resolved and retain complete experience in Hindsight."""
    try:
        res = incident_service.resolve_incident(
            incident_id=incident_id,
            root_cause=req.root_cause,
            resolution=req.resolution,
            lesson_learned=req.lesson_learned
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed resolving incident: {str(e)}")
