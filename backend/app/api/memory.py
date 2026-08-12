from fastapi import APIRouter, Query, HTTPException, Path
from typing import Optional, List, Dict, Any
from app.models.memory import MemoryBankInfo, MemoryRecallResponse
from app.services.memory_service import memory_service
from app.services.incident_service import incident_service

router = APIRouter()

@router.get("/memory/status", response_model=MemoryBankInfo)
async def get_memory_status():
    """Get status of Hindsight memory engine."""
    return memory_service.get_memory_status()

@router.post("/memory/search", response_model=MemoryRecallResponse)
async def search_memory(
    body: Dict[str, Any]
):
    """Directly search historical memories in Hindsight."""
    query_text = body.get("query_text", "")
    symptoms = body.get("symptoms", [])
    service = body.get("service")
    
    return memory_service.recall_similar_incidents(
        query_text=query_text,
        symptoms=symptoms,
        service=service,
        top_k=3,
        memory_enabled=True
    )

@router.get("/memory/incidents/{incident_id}")
async def get_incident_memory(incident_id: str = Path(...)):
    """Get Hindsight memory recalled for a specific incident."""
    inc = incident_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found.")
    
    query_text = f"{inc.title} {inc.service} {' '.join(inc.symptoms)}"
    recalled = memory_service.recall_similar_incidents(
        query_text=query_text,
        symptoms=inc.symptoms,
        service=inc.service,
        incident_id=inc.incident_id,
        top_k=3,
        memory_enabled=True
    )
    
    return {
        "incident_id": incident_id,
        "recalled_memories": recalled.model_dump(),
        "memory_status": memory_service.get_memory_status().model_dump()
    }
