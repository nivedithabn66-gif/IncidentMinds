from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Dict, Any
from app.models.real_incident import RealIncidentOutcomeRequest
from app.services.real_incident_service import real_incident_service

router = APIRouter()

@router.post("/upload")
async def upload_incident_files(files: List[UploadFile] = File(...)):
    """
    Upload real-world incident files (.txt, .log, .csv, .json, .md, .pdf).
    Validates format/size, redacts secrets, extracts evidence signals, and creates session.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    raw_file_tuples = []
    for file in files:
        content = await file.read()
        raw_file_tuples.append((file.filename, content))

    session = real_incident_service.process_uploaded_files(raw_file_tuples)
    return session

@router.post("/{session_id}/analyze")
async def analyze_real_incident_session(session_id: str):
    """
    Trigger Hindsight memory search and AI analysis using uploaded evidence.
    """
    try:
        return real_incident_service.analyze_real_incident(session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{session_id}")
async def get_real_incident_session(session_id: str):
    """Retrieve full analysis session data by ID."""
    session = real_incident_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return session

@router.get("/{session_id}/memory")
async def get_session_memories(session_id: str):
    """Retrieve Hindsight memories recalled for a specific real incident session."""
    session = real_incident_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found.")
    return {
        "session_id": session.session_id,
        "recalled_memory_source": session.recalled_memory_source,
        "memories": session.hindsight_memories_recalled
    }

@router.post("/{session_id}/investigate")
async def investigate_action_simulation(
    session_id: str,
    action_name: str = Form("Inspect Database Connection Pool")
):
    """Execute a simulation-only diagnostic action on the real incident session."""
    try:
        return real_incident_service.simulate_investigation_action(session_id, action_name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{session_id}/outcome")
async def record_session_outcome(session_id: str, outcome_req: RealIncidentOutcomeRequest):
    """
    Record confirmed outcome/lesson learned and store experience into Hindsight vector store.
    """
    try:
        return real_incident_service.record_outcome_and_store_memory(session_id, outcome_req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("")
async def list_real_incident_sessions():
    """List past uploaded incident analysis sessions."""
    return real_incident_service.list_sessions()
