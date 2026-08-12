export interface TimelineEvent {
  id: string;
  timestamp: string;
  event_type: 'detection' | 'memory_search' | 'action' | 'recommendation' | 'resolution' | 'status_change' | 'memory';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface ActionAttempt {
  action_id: string;
  action_name: string;
  timestamp?: string;
  executed_at?: string;
  status: 'SUCCESS' | 'FAILED' | 'INCONCLUSIVE';
  result_message: string;
  reason?: string;
  details?: Record<string, any>;
}

export interface Incident {
  incident_id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info' | string;
  service: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | string;
  symptoms: string[];
  metrics: {
    latency_sec?: number;
    error_rate_pct?: number;
    db_conn_pct?: number;
    cpu_pct?: number;
    memory_pct?: number;
    [key: string]: any;
  };
  logs: string[];
  recent_changes: string[];
  possible_causes: string[];
  timeline: TimelineEvent[];
  failed_attempts: ActionAttempt[];
  successful_actions: ActionAttempt[];
  root_cause?: string;
  resolution?: string;
  lesson_learned?: string;
  memory_recalled?: {
    top_match?: MemoryRecallResult;
    total_memories_searched: number;
    avoid_failed_approaches: string[];
    recommended_successful_approaches: string[];
  };
}

export interface MemoryRecallResult {
  memory_id: string;
  incident_id: string;
  title: string;
  similarity_score: number;
  relevance_label?: string;
  service: string;
  symptoms?: string[];
  matched_symptoms: string[];
  root_cause: string;
  resolution: string;
  failed_approaches: string[];
  successful_approaches: string[];
  lesson_learned: string;
  match_rationale: string;
  timestamp?: string;
}

export type MemoryRecallItem = MemoryRecallResult;

export interface MemoryStatus {
  hindsight_configured: boolean;
  hindsight_url?: string;
  mode: 'hindsight_cloud' | 'hindsight_local' | 'fallback_semantic_engine' | string;
  total_incident_memories: number;
  failed_approaches_count: number;
  successful_fixes_count: number;
}

export interface InvestigationResult {
  incident_id: string;
  memory_enabled?: boolean;
  agent_status: string;
  confidence_score?: number;
  summary_assessment?: string;
  memory_influence_score?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | string;
  previous_failures?: string[];
  previous_successes?: string[];
  recommended_action?: string;
  reason?: string;
  memory_recalled?: {
    top_match?: MemoryRecallResult;
    recalled_count?: number;
    avoid_failed_approaches: string[];
    prioritized_actions?: string[];
    hindsight_mode?: string;
  };
  recalled_memories?: {
    historical_matches?: MemoryRecallResult[];
    avoid_failed_approaches?: string[];
  };
  avoid_failed_approaches?: string[];
  recommended_next_steps: Array<{
    step_order?: number;
    action_id: string;
    action_name?: string;
    title?: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
    status: 'RECOMMENDED' | 'CONSIDER' | 'AVOID' | 'SUGGESTED' | string;
    reasoning?: string;
    reason?: string;
  }>;
  why_this_recommendation?: {
    historical_memory_found: {
      incident_id: string;
      title: string;
      similarity_score: string;
      relevance_label?: string;
      service?: string;
    };
    historical_failed_attempts_to_avoid: string[];
    historical_successful_resolutions: string[];
    current_evidence: string[];
    conclusion: string;
  };
}

export interface LearningSummary {
  stats: {
    historical_incidents: number;
    similar_incidents_found: number;
    failed_approaches_remembered: number;
    successful_resolutions: number;
    hindsight_mode: string;
  };
  recurring_patterns: Array<{
    pattern_id: string;
    trigger: string;
    service: string;
    root_cause_association: string;
    occurrences: number;
    confidence: string;
    key_takeaway: string;
  }>;
  failed_approaches: Array<{
    approach: string;
    failures_count: number;
    context: string;
  }>;
  successful_approaches: Array<{
    approach: string;
    success_count: number;
    context: string;
  }>;
  learned_lessons: Array<{
    incident_id: string;
    service: string;
    lesson: string;
  }>;
}

export interface UploadedFileMetadata {
  file_id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  status: 'uploaded' | 'parsed' | 'error';
  error_message?: string;
}

export interface RealIncidentSession {
  session_id: string;
  created_at: string;
  source_type: string;
  files: UploadedFileMetadata[];
  service: string;
  incident_type: string;
  observed_facts: string[];
  inferences: string[];
  symptoms: string[];
  metrics: Record<string, any>;
  errors: string[];
  logs: string[];
  deployments: string[];
  timestamps: string[];
  possible_causes: string[];
  raw_evidence_summary: string;
  truncated: boolean;
  secrets_redacted_count: number;
  status: 'uploaded' | 'analyzed' | 'investigating' | 'resolved';
  investigation_history: Array<Record<string, any>>;
  hindsight_memories_recalled: Array<Record<string, any>>;
  recalled_memory_source: string;
  ai_assessment: Record<string, any>;
  outcome_confirmed?: {
    status: string;
    confirmed_root_cause: string;
    actual_resolution: string;
    lesson_learned: string;
    confirmed_at: string;
  };
  memory_stored: boolean;
}
