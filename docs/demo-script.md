# IncidentMind — Hackathon Presentation & Demo Script (2–3 Minutes)

> **Tagline**: *IncidentMind turns incident history into operational experience.*

---

## STORY A — Controlled Demo (Scenario Recurrence)

### 1. Problem Statement (0:00 - 0:30)

"Standard AI coding and SRE assistants can analyze telemetry for today's incident, but they have a fatal flaw: **they forget yesterday's operational failures**.

When a recurring incident happens, a traditional AI agent repeatedly suggests the exact same trial-and-error steps—like scaling caches or restarting service containers—wasting critical outage minutes (MTTR ~ 45 mins).

**IncidentMind** solves this using **Hindsight by Vectorize**: a long-term vector memory engine that remembers past postmortems, failed troubleshooting attempts, and successful resolutions."

---

### 2. Step 1: Historical Incident (`INC-1042`) (0:30 - 1:00)

1. Navigate to the **Hackathon Demo Suite** tab in the sidebar (or click **Demo Mode**).
2. Click **Step 1: Load Historical Incident (INC-1042)**.
3. Show the incident details:
   - **Service**: `payment-api`
   - **Symptoms**: API latency 4.8s, Error rate 12%, DB connection utilization 98%.
4. Run the historical investigation:
   - **Action 1**: *Increase Redis Cache Size* → ❌ **FAILED** (Cache hit ratio was already 94.2%).
   - **Action 2**: *Restart API Service Containers* → ❌ **FAILED** (Temporary 45s drop, then re-exhausted).
   - **Action 3**: *Inspect Database Connection Pool* → ✅ **SUCCESS** (Expanded pool limit to 300 connections).
5. Click **Resolve & Store Experience**. Show the confirmation message:
   - *"Experience retained in Hindsight long-term vector bank."*

---

### 3. Step 2: New Incident Recurrence (`INC-1087`) & Memory Recall (1:00 - 1:45)

1. Click **Step 3: Create Similar Incident (INC-1087)**.
2. Show the new active incident:
   - Same service (`payment-api`), same symptoms (API latency 5.1s, DB connections 96%).
3. Click **Step 4: Run Memory-Aware Investigation** (with **Memory ON**).
4. Point out the AI Agent output:
   - **Badge**: `🟢 Hindsight Memory Recalled`
   - **Matched Incident**: `INC-1042` (94% similarity match).
   - **Avoided Approach**: `Increase Redis Cache Size` is flagged with `[AVOID - Previously Failed Attempt]`.
   - **Top Recommendation**: `Inspect Database Connection Pool` is boosted to `#1 Priority`.
5. Toggle **Memory OFF** at the top right to demonstrate the contrast:
   - Without Memory, the agent falls back to generic cache scaling.
   - Toggle **Memory ON** back to show adaptive reasoning in action!

---

## STORY B — Real Incident Mode (File Ingestion & Hindsight Recall)

### 1. Upload Real Evidence Files (1:45 - 2:15)

1. Click **📄 Real Incident** in the sidebar navigation.
2. Upload multi-format evidence files (`api-error.log`, `metrics.csv`, `deployment.json`) or click **Load Real Incident Sample**.
3. Point out:
   - **Multi-file Ingestion**: Automatically groups files into a unified analysis session.
   - **Secret Redaction**: Obvious API keys, tokens, and passwords are masked before LLM processing.
   - **Observed Facts vs AI Inferences**: Shows strict separation between verified facts (latency 5.4s, DB conns 98%) and AI inferences.

---

### 2. Hindsight Search & Outcome Learning Loop (2:15 - 3:00)

1. Click **Analyze Incident**.
2. Show the Hindsight recall panel:
   - `🧠 Hindsight Memory` retrieves relevant operational history.
   - Recommends simulation action `[Simulate: Inspect DB Connection Pool]`.
3. Fill out **What actually happened?**:
   - Select `Root cause confirmed`.
   - Enter root cause: *Database connection pool exhaustion*.
   - Click **Confirm Outcome & Retain Memory in Hindsight**.
4. Conclude with the core takeaway:

> *"IncidentMind turns raw real-world logs, metrics, and incident documents into reusable operational experience. The next time a similar incident occurs, IncidentMind remembers what worked and what failed."*
