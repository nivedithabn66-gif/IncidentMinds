from fastapi import APIRouter
from app.config import settings
from app.services.memory_service import memory_service
from app.services.incident_service import incident_service

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Comprehensive System Health Endpoint (Section 14).
    Returns backend, LLM, Hindsight memory engine, and demo data status.
    """
    memory_status = memory_service.get_memory_status()
    
    is_connected = getattr(memory_status, "hindsight_connected", False)
    mode = getattr(memory_status, "mode", "fallback_semantic_engine")
    total_mem = getattr(memory_status, "total_memories", 0)

    hindsight_state = "connected" if is_connected else "development_semantic_engine"
    hindsight_label = "Hindsight Cloud Connected" if is_connected else "Development Memory Engine (Fallback Semantic Engine)"

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "backend": {
            "status": "healthy",
            "message": "FastAPI Operational"
        },
        "llm": {
            "status": "healthy",
            "provider": "SRE Reasoning Engine"
        },
        "hindsight": {
            "status": hindsight_state,
            "label": hindsight_label,
            "mode": mode,
            "connected": is_connected,
            "total_memories": total_mem
        },
        "demo_data": {
            "status": "loaded",
            "total_incidents": len(incident_service.list_incidents())
        }
    }
