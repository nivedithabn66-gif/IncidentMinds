import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, Server, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import { createIncidentApi } from '../services/api';
import { Incident } from '../types';

interface IncidentSimulatorViewProps {
  onIncidentCreated: (incident: Incident) => void;
  onNavigateToIncident: (incidentId: string) => void;
}

const PRESET_SCENARIOS = [
  {
    id: 'api-latency',
    title: 'API Latency Spike',
    service: 'api-gateway',
    severity: 'critical',
    symptoms: ['API latency > 5.0s', 'High DB connection utilization (96%)', 'HTTP 504 Gateway Timeouts'],
    metrics: { latency_sec: 5.1, error_rate_pct: 11.4, cpu_pct: 42, memory_pct: 58, db_conn_pct: 96 },
    logs: [
      'ERROR [api-gateway] Upstream checkout service response time 5120ms exceeded SLA (500ms)',
      'WARN [checkout-db-pool] Connection pool at 96/100 connections in use',
      'ERROR [http-listener] Request timeout on /v2/checkout/process'
    ],
    recent_changes: ['Deployed v2.4.0 checkout service', 'Updated DB connection timeout']
  },
  {
    id: 'db-timeout',
    title: 'Database Timeout',
    service: 'payment-db',
    severity: 'critical',
    symptoms: ['PostgreSQL query timeout', 'Write queue backlog > 1200', 'Lock contention on orders table'],
    metrics: { latency_sec: 8.4, error_rate_pct: 24.1, cpu_pct: 88, memory_pct: 82, db_conn_pct: 100 },
    logs: [
      'FATAL [postgres] connection limit reached for user checkout_app',
      'ERROR [orm] Query timeout after 10000ms: SELECT * FROM orders WHERE status = pending',
      'WARN [connection-manager] Queue depth 142 waiting for db handle'
    ],
    recent_changes: ['Database index maintenance script executed']
  },
  {
    id: 'auth-failure',
    title: 'Authentication Failure',
    service: 'auth-gateway',
    severity: 'high',
    symptoms: ['HTTP 401 Authorization spike', 'JWT signature verification failed', 'User session drops'],
    metrics: { latency_sec: 0.8, error_rate_pct: 35.0, cpu_pct: 28, memory_pct: 34, db_conn_pct: 14 },
    logs: [
      'ERROR [jwt-validator] Invalid RS256 signature for key ID k8s-sec-auth-v2',
      'WARN [auth-middleware] 401 Unauthorized spike on /api/v1/user/profile',
      'ERROR [vault-sync] Public key secret sync delayed by 300s'
    ],
    recent_changes: ['Automated JWT key rotation secret updated']
  },
  {
    id: 'memory-leak',
    title: 'Memory Leak',
    service: 'recommendation-engine',
    severity: 'high',
    symptoms: ['OOMKilled pods', 'Heap memory 94%', 'GC pause duration 1200ms'],
    metrics: { latency_sec: 3.2, error_rate_pct: 8.2, cpu_pct: 65, memory_pct: 94, db_conn_pct: 32 },
    logs: [
      'WARN [jvm] GC overhead limit exceeded. Heap 3.8GB / 4.0GB utilized',
      'ERROR [k8s] Pod recommendation-engine-78f9d OOMKilled exit code 137',
      'INFO [cache] Memory cache retention policy failed to evict expired items'
    ],
    recent_changes: ['Enabled ML model embedding in-memory cache']
  },
  {
    id: 'cpu-saturation',
    title: 'CPU Saturation',
    service: 'analytics-worker',
    severity: 'high',
    symptoms: ['CPU throttling > 85%', 'Async worker backlog', 'Node load average 16.4'],
    metrics: { latency_sec: 4.1, error_rate_pct: 4.8, cpu_pct: 98, memory_pct: 62, db_conn_pct: 45 },
    logs: [
      'WARN [k8s-cgroups] Container analytics-worker CPU throttling 89.2% of execution time',
      'ERROR [task-queue] Queue worker thread pool exhausted (64/64 busy threads)',
      'INFO [cpu-monitor] Host node cpu load average 16.4 exceeds 8.0 limit'
    ],
    recent_changes: ['Triggered monthly batch report aggregation job']
  },
  {
    id: 'payment-failure',
    title: 'Payment Service Failure',
    service: 'payment-processor',
    severity: 'critical',
    symptoms: ['Stripe webhook callback timeout', 'Payment gateway 502 Bad Gateway', 'Cart abandonment spike'],
    metrics: { latency_sec: 6.8, error_rate_pct: 42.0, cpu_pct: 54, memory_pct: 48, db_conn_pct: 68 },
    logs: [
      'ERROR [stripe-sdk] Request connection timed out after 5000ms',
      'FATAL [payment-orchestrator] Payment authorization failed for transaction tx_98123',
      'WARN [circuit-breaker] Payment gateway circuit breaker TRIPPED (OPEN state)'
    ],
    recent_changes: ['Updated payment provider SDK version to v4.1']
  }
];

export const IncidentSimulatorView: React.FC<IncidentSimulatorViewProps> = ({
  onIncidentCreated,
  onNavigateToIncident
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SCENARIOS[0]);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerIncident = async () => {
    setIsTriggering(true);
    try {
      const created = await createIncidentApi({
        title: selectedPreset.title,
        severity: selectedPreset.severity,
        service: selectedPreset.service,
        symptoms: selectedPreset.symptoms,
        metrics: selectedPreset.metrics,
        logs: selectedPreset.logs,
        recent_changes: selectedPreset.recent_changes
      });

      onIncidentCreated(created);
      onNavigateToIncident(created.incident_id);
    } catch (err) {
      console.error('Failed triggering incident:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[var(--bg-surface2)] to-[var(--bg-surface2)] border border-amber-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 border border-amber-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold im-text-primary">Incident Simulator</h2>
          </div>
          <p className="text-xs im-text-muted mt-1 max-w-xl">
            Create controlled synthetic incidents to demonstrate how IncidentMind recalls memories and avoids previous troubleshooting mistakes.
          </p>
        </div>

        <button
          onClick={handleTriggerIncident}
          disabled={isTriggering}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-900/30 transition-all flex items-center gap-2"
        >
          {isTriggering ? (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
          ) : (
            <Play className="h-4 w-4 fill-slate-950" />
          )}
          <span>Trigger Incident Now</span>
        </button>
      </div>

      {/* Preset Scenarios Selector Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase im-text-muted tracking-wider">
          Select Preset Failure Scenario
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all duration-150 space-y-2 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-950/50'
                    : 'im-bg-surface im-border hover:im-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold im-text-primary">{preset.service}</span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      preset.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                    }`}
                  >
                    {preset.severity}
                  </span>
                </div>

                <div className="text-sm font-bold im-text-primary">{preset.title}</div>
                <p className="text-xs im-text-muted line-clamp-1">{preset.symptoms[0]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configured Incident Parameter Preview */}
      <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b im-border pb-3">
          <span className="font-bold im-text-primary flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-600" />
            Configured Incident Parameters ({selectedPreset.title})
          </span>
          <span className="im-text-faint text-[10px]">Ready to inject</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Symptoms & Changes */}
          <div className="space-y-3">
            <div>
              <span className="im-text-muted font-bold block mb-1">Symptoms To Inject</span>
              <ul className="space-y-1 text-amber-600 text-[11px]">
                {selectedPreset.symptoms.map((sym, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 bg-amber-500/10 p-1.5 rounded border border-amber-800/30">
                    <span className="text-amber-600">●</span> {sym}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="im-text-muted font-bold block mb-1">Recent Changes Context</span>
              <ul className="space-y-1 im-text-secondary text-[11px]">
                {selectedPreset.recent_changes.map((change, idx) => (
                  <li key={idx} className="im-bg-surface2 p-1.5 rounded border im-border">
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Metrics & Logs Stream */}
          <div className="space-y-3">
            <div>
              <span className="im-text-muted font-bold block mb-1">Telemetry Metrics Baseline</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 im-bg-surface2 rounded border im-border">
                  <span className="im-text-faint text-[9px] block">LATENCY</span>
                  <span className="text-amber-600 font-bold">{selectedPreset.metrics.latency_sec}s</span>
                </div>
                <div className="p-2 im-bg-surface2 rounded border im-border">
                  <span className="im-text-faint text-[9px] block">ERRORS</span>
                  <span className="text-rose-500 font-bold">{selectedPreset.metrics.error_rate_pct}%</span>
                </div>
                <div className="p-2 im-bg-surface2 rounded border im-border">
                  <span className="im-text-faint text-[9px] block">DB CONNS</span>
                  <span className="text-purple-600 font-bold">{selectedPreset.metrics.db_conn_pct}%</span>
                </div>
              </div>
            </div>

            <div>
              <span className="im-text-muted font-bold block mb-1">Simulated Log Stream</span>
              <div className="p-2.5 rounded im-bg-app border im-border text-[10px] im-text-secondary space-y-1 font-mono">
                {selectedPreset.logs.map((log, idx) => (
                  <div key={idx} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
