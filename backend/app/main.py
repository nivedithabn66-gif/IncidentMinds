from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.config import settings
from app.api import health, incidents, agent, memory, learning, real_incidents

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI SRE Agent With Long-Term Memory (Hindsight by Vectorize)"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(incidents.router, prefix=settings.API_PREFIX, tags=["Incidents"])
app.include_router(agent.router, prefix=settings.API_PREFIX, tags=["AI Agent"])
app.include_router(memory.router, prefix=settings.API_PREFIX, tags=["Hindsight Memory"])
app.include_router(learning.router, prefix=settings.API_PREFIX, tags=["Learning Engine"])
app.include_router(real_incidents.router, prefix=f"{settings.API_PREFIX}/real-incidents", tags=["Real Incident File Ingestion"])

@app.get("/")
async def root():
    return {
        "message": "IncidentMind AI SRE Backend API is running",
        "docs": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
