import { Incident, MemoryStatus, InvestigationResult, LearningSummary, MemoryRecallResult, RealIncidentSession } from '../types';

const API_BASE = '/api';

export async function fetchIncidents(): Promise<Incident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) throw new Error('Failed fetching incidents');
  return res.json();
}

export async function createIncidentApi(data: {
  title: string;
  severity: string;
  service: string;
  symptoms: string[];
  metrics: Record<string, any>;
  logs: string[];
  recent_changes: string[];
}): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed creating simulated incident');
  return res.json();
}

export async function fetchMemoryStatus(): Promise<MemoryStatus> {
  const res = await fetch(`${API_BASE}/memory/status`);
  if (!res.ok) throw new Error('Failed fetching memory status');
  return res.json();
}

export async function triggerInvestigation(
  incidentId: string,
  memoryEnabled: boolean = true
): Promise<InvestigationResult> {
  const res = await fetch(
    `${API_BASE}/incidents/${incidentId}/investigate?memory_enabled=${memoryEnabled}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Failed executing agent investigation');
  return res.json();
}

export async function executeSimulatedAction(
  incidentId: string,
  actionId: string,
  actionName: string
) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_id: actionId,
      action_name: actionName
    })
  });
  if (!res.ok) throw new Error('Failed executing simulated action');
  return res.json();
}

export async function resolveIncidentApi(
  incidentId: string,
  rootCause: string,
  resolution: string,
  lessonLearned: string
) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      root_cause: rootCause,
      resolution: resolution,
      lesson_learned: lessonLearned
    })
  });
  if (!res.ok) throw new Error('Failed resolving incident');
  return res.json();
}

export async function fetchLearningSummary(): Promise<LearningSummary> {
  const res = await fetch(`${API_BASE}/learning/summary`);
  if (!res.ok) throw new Error('Failed fetching learning summary');
  return res.json();
}

export async function fetchLearningHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/learning/history`);
  if (!res.ok) throw new Error('Failed fetching learning history');
  return res.json();
}

export async function fetchRecurringPatterns(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/learning/patterns`);
  if (!res.ok) throw new Error('Failed fetching recurring patterns');
  return res.json();
}

export async function runMemoryExperimentApi(incidentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/experiment`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed running memory experiment');
  return res.json();
}

export async function searchMemoryApi(query: string): Promise<MemoryRecallResult[]> {
  const res = await fetch(`${API_BASE}/memory/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query_text: query })
  });
  if (!res.ok) throw new Error('Failed searching memory');
  const data = await res.json();
  return data.historical_matches || [];
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/incidents/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed resetting demo state');
  return res.json();
}

/* =================================================================
   REAL INCIDENT MODE API CLIENT FUNCTIONS
   ================================================================= */

export async function uploadIncidentFiles(files: File[]): Promise<RealIncidentSession> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const res = await fetch(`${API_BASE}/real-incidents/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed uploading real incident files');
  }

  return res.json();
}

export async function analyzeRealIncident(sessionId: string): Promise<RealIncidentSession> {
  const res = await fetch(`${API_BASE}/real-incidents/${sessionId}/analyze`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed analyzing real incident session');
  return res.json();
}

export async function getRealIncidentSession(sessionId: string): Promise<RealIncidentSession> {
  const res = await fetch(`${API_BASE}/real-incidents/${sessionId}`);
  if (!res.ok) throw new Error('Failed fetching real incident session');
  return res.json();
}

export async function simulateRealIncidentAction(sessionId: string, actionName: string) {
  const formData = new FormData();
  formData.append('action_name', actionName);

  const res = await fetch(`${API_BASE}/real-incidents/${sessionId}/investigate`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Failed executing simulation action');
  return res.json();
}

export async function recordRealIncidentOutcome(sessionId: string, outcomeReq: {
  outcome_status: string;
  confirmed_root_cause: string;
  actual_resolution: string;
  lesson_learned: string;
  successful_action?: string;
  failed_actions?: string[];
}): Promise<RealIncidentSession> {
  const res = await fetch(`${API_BASE}/real-incidents/${sessionId}/outcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(outcomeReq)
  });
  if (!res.ok) throw new Error('Failed submitting outcome feedback');
  return res.json();
}

export async function listRealIncidentSessions(): Promise<RealIncidentSession[]> {
  const res = await fetch(`${API_BASE}/real-incidents`);
  if (!res.ok) throw new Error('Failed fetching real incident sessions');
  return res.json();
}
