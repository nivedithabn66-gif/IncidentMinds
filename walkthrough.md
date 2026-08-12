# IncidentMind — AI SRE Agent With Long-Term Memory

**IncidentMind** is an AI SRE/DevOps assistant that remembers past system failures, learns from previous troubleshooting attempts, and adapts future incident response using **Hindsight by Vectorize**.

---

## 📽️ Demo Session Video

Below is the automated browser session recording demonstrating the full **Remember → Learn → Adapt** loop in action:

![IncidentMind Demo Flow](file:///c:/Users/Niveditha%20B%20N/OneDrive/Documents/Hacky/IncidentMind%20AI/incidentmind_demo_flow.webp)

---

## 🚀 Key Features Implemented

1. **Persistent Memory Integration (`Hindsight by Vectorize`)**:
   - Isolated `MemoryService` abstraction (`memory_service.py`) supporting official `hindsight-client` Python SDK with seamless local semantic fallback adapter.
   - Core Hindsight operations: `retain` (ingesting experiences), `recall` (retrieving relevant past failures/fixes), and `reflect` (reasoning over patterns).

2. **Primary Demo Scenario (INC-1042 → INC-1087)**:
   - **INC-1042 (Historical Incident)**: Latency spike (4.8s), DB connections (98%). Cache scaling **FAILED**, DB pool check **SUCCEEDED**. Retained in Hindsight memory.
   - **INC-1087 (Recurrence Target)**: Latency spike (5.1s), DB connections (96%).
   - **AI Agent Intelligence**: IncidentMind recalls INC-1042 with **91% similarity**, explicitly **AVOIDS** Cache Scaling (previously failed), and **PRIORITIZES** DB Connection Pool inspection.

3. **Operations Dashboard & Explainable AI**:
   - Modern SRE dark mode interface with glassmorphism design system.
   - Live Memory Intelligence metrics (Historical Incidents: 142+, Similar Matches: 7, Failed Approaches: 23+, Successful Resolutions: 41+).
   - **"Why this recommendation?"** transparent rationale card detailing memory match %, failed steps avoided, current evidence, and conclusion.
   - Interactive Action Simulator allowing on-call engineers to execute diagnostic actions and resolve incidents with automatic postmortem retention into Hindsight memory.

4. **Learning Dashboard & Before vs After Comparison**:
   - **What IncidentMind Has Learned**: Tracks systemic patterns, failed approach breakdowns, prioritized fixes, and postmortem lessons.
   - **Before vs After**: Side-by-side comparison illustrating MTTR reduction from ~45 minutes to <3 minutes.

---

## 🛠️ Monorepo Structure

```
IncidentMind AI/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI server entry point
│   │   ├── config.py              # Configuration & Environment settings
│   │   ├── models/                # Pydantic schemas (incident.py, memory.py)
│   │   ├── api/                   # REST API routes (incidents, agent, memory, learning, health)
│   │   ├── services/              # Core logic (incident_service, agent_service, memory_service, analysis_service)
│   │   └── utils/                 # Seed data & data helpers (seed_data.py)
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/            # React UI components (Navbar, MemoryPanel, ExplainableRecPanel, etc.)
│   │   ├── pages/                 # Main page views
│   │   ├── services/              # API client wrapper (api.ts)
│   │   ├── types/                 # TypeScript interfaces (index.ts)
│   │   ├── App.tsx                # Main App layout & state management
│   │   └── index.css              # Custom Tailwind CSS styling & animations
│   ├── package.json               # Node.js dependencies
│   └── vite.config.ts             # Vite bundler configuration
├── data/                          # Data directory for persistent memories
├── README.md                      # Comprehensive project documentation
└── walkthrough.md                 # Detailed walkthrough artifact
```

---

## ⚙️ Running Locally

### 1. Backend (Python FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend dashboard will be live at `http://localhost:5173`.
