from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.analysis_service import analysis_service
from app.services.incident_reasoning_service import reasoning_service

router = APIRouter()

@router.get("/learning")
async def get_learning_dashboard():
    """Get aggregated 'What IncidentMind Has Learned' metrics."""
    return await analysis_service.get_learning_summary()

@router.get("/learning/history", response_model=List[Dict[str, Any]])
async def get_learning_history():
    """Get chronological learning history log (Section 16)."""
    return reasoning_service.get_learning_history()

@router.get("/learning/patterns", response_model=List[Dict[str, Any]])
async def get_recurring_patterns():
    """Get systemic recurring failure patterns across historical incidents (Section 8)."""
    return reasoning_service.get_recurring_patterns()
