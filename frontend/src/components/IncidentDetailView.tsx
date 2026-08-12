import React, { useState } from 'react';
import { Incident, InvestigationResult, MemoryRecallItem } from '../types';
import { HistoricalMemoryCard } from './HistoricalMemoryCard';
import { ActionsPanel } from './ActionsPanel';
import { TimelineView } from './TimelineView';
import { WhyRecommendationModal } from './WhyRecommendationModal';
import { ResolveIncidentModal } from './ResolveIncidentModal';
import {
  Brain,
  Sparkles,
  Terminal,
  Activity,
  Server,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Play
} from 'lucide-react';

interface IncidentDetailViewProps {
  incident: Incident;
  investigation: InvestigationResult | null;
  onRunInvestigation: (incidentId: string) => Promise<void>;
  onExecuteAction: (actionId: string, actionName: string) => Promise<void>;
  onResolveIncident: (rootCause: string, resolution: string, lessonLearned: string) => Promise<void>;
  onBackToDashboard?: () => void;
  isInvestigating?: boolean;
  onAddToast?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'memory') => void;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  investigation,
  onRunInvestigation,
  onExecuteAction,
  onResolveIncident,
  onBackToDashboard,
  isInvestigating = false,
  onAddToast
}) => {
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const recalledMemories: MemoryRecallItem[] =
    investigation?.recalled_memories?.historical_matches ||
    (incident as any).recalled_memories?.historical_matches ||
    [];

  const topMemory = recalledMemories.length > 0 ? recalledMemories[0] : null;

  const recAction = investigation?.recommended_next_steps?.[0] || {
    action_id: 'check_db_pool',
    action_name: 'Inspect Database Connection Pool',
    reason: 'A previous incident (INC-1042) with similar symptoms was caused by database connection pool exhaustion. Cache scaling was previously attempted and failed.',
    confidence: 0.94
  };

  const handleResolveConfirm = async (rootCause: string, resolution: string, lessonLearned: string) => {
    await onResolveIncident(rootCause, resolution, lessonLearned);
    if (onAddToast) {
      onAddToast('Incident Resolved', '🧠 New experience stored in Hindsight long-term memory.', 'memory');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar (Spec 5) */}
      <div className="p-6 rounded-2xl im-bg-surface border im-border space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {onBackToDashboard && (
                <button
                  onClick={onBackToDashboard}
                  className="p-1.5 rounded-lg im-bg-badge hover:im-bg-surface3 im-text-secondary transition-colors mr-1"
                  title="Back to dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <span className="font-mono text-xs font-bold im-bg-code text-blue-600 px-2.5 py-1 rounded-md border im-border">
                {incident.incident_id}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-rose-500/20 text-rose-500 border border-rose-500/30">
                {incident.severity}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 border border-blue-800">
                {incident.status}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold im-text-primary tracking-tight">{incident.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs im-text-muted mt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-blue-600" />
                Service: <strong className="im-text-secondary">{incident.service}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 im-text-faint" />
                Detected: {new Date(incident.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsResolveModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 im-text-primary font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Resolve Incident</span>
            </button>

            <button
              onClick={() => onRunInvestigation(incident.incident_id)}
              disabled={isInvestigating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 im-text-primary font-bold text-xs shadow-lg shadow-blue-500/25 border border-white/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Brain className={`h-4 w-4 im-text-primary ${isInvestigating ? 'animate-spin' : ''}`} />
              <span>{isInvestigating ? 'Querying Hindsight...' : 'Run SRE Investigation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Telemetry Metrics Cards (Spec 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl im-bg-surface border im-border">
          <span className="im-text-faint text-[10px] block">LATENCY</span>
          <span className="text-xl font-bold text-amber-600">{incident.metrics.latency_sec || 5.1}s</span>
          <span className="text-[9px] im-text-faint block mt-0.5">SLA: &lt;0.3s</span>
        </div>

        <div className="p-3.5 rounded-xl im-bg-surface border im-border">
          <span className="im-text-faint text-[10px] block">ERROR RATE</span>
          <span className="text-xl font-bold text-rose-500">{incident.metrics.error_rate_pct || 11.4}%</span>
          <span className="text-[9px] im-text-faint block mt-0.5">504 Gateway</span>
        </div>

        <div className="p-3.5 rounded-xl im-bg-surface border im-border">
          <span className="im-text-faint text-[10px] block">CPU UTIL</span>
          <span className="text-xl font-bold text-blue-600">{incident.metrics.cpu_pct || 42}%</span>
          <span className="text-[9px] im-text-faint block mt-0.5">Baseline: Normal</span>
        </div>

        <div className="p-3.5 rounded-xl im-bg-surface border im-border">
          <span className="im-text-faint text-[10px] block">MEMORY</span>
          <span className="text-xl font-bold im-text-secondary">{incident.metrics.memory_pct || 58}%</span>
          <span className="text-[9px] im-text-faint block mt-0.5">3.4GB / 6.0GB</span>
        </div>

        <div className="p-3.5 rounded-xl im-bg-surface border im-border">
          <span className="im-text-faint text-[10px] block">DB CONNS</span>
          <span className="text-xl font-bold text-rose-500">{incident.metrics.db_conn_pct || 96}%</span>
          <span className="text-[9px] text-rose-500 font-bold block mt-0.5">96/100 Max Pool</span>
        </div>
      </div>

      {/* Visual Centerpiece: Historical Memory Section (Spec 6) */}
      {topMemory ? (
        <HistoricalMemoryCard memory={topMemory} />
      ) : (
        <div className="p-6 rounded-2xl im-bg-surface border im-border text-center space-y-2">
          <Brain className="h-8 w-8 im-text-faint mx-auto" />
          <h4 className="text-sm font-bold im-text-secondary">No Relevant Historical Memory Found</h4>
          <p className="text-xs im-text-faint">
            Hindsight will record this incident experience upon resolution to prepare for future outages.
          </p>
        </div>
      )}

      {/* AI Recommendation Card (Spec 7) */}
      {!isDismissed && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[var(--bg-surface)] to-[var(--bg-surface2)] border border-blue-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-600 border border-blue-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block">
                  AI INVESTIGATION RECOMMENDATION
                </span>
                <h3 className="text-base font-bold im-text-primary">
                  Recommended Action: <span className="text-blue-600">{recAction.action_name}</span>
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
              94% Confidence
            </span>
          </div>

          <p className="text-xs im-text-secondary leading-relaxed font-sans">
            "{recAction.reason}"
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono im-text-muted">
              <span>Historical Evidence: INC-1042</span>
              <span>•</span>
              <span>Current Evidence: DB Conns 96%</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDismissed(true)}
                className="px-3.5 py-1.5 im-bg-badge hover:im-bg-surface3 im-text-muted hover:im-text-secondary rounded-xl text-xs font-medium border im-border"
              >
                Dismiss
              </button>

              <button
                onClick={() => setIsWhyModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 rounded-xl text-xs font-bold border border-purple-500/40"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Why this recommendation?</span>
              </button>

              <button
                onClick={() => onExecuteAction(recAction.action_id, recAction.action_name || '')}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 im-text-primary font-bold rounded-xl text-xs shadow-lg shadow-blue-900/30"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>Investigate Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Actions Panel & Result Execution Flow (Spec 16) */}
      <ActionsPanel
        incident={incident}
        onExecuteAction={onExecuteAction}
        onResolveIncident={onResolveIncident}
        avoidActions={['increase_cache', 'restart_service']}
        recommendedActions={['check_db_pool']}
      />

      {/* Investigation Timeline Audit Trail (Spec 9) */}
      <TimelineView timeline={incident.timeline} />

      {/* Why Recommendation Evidence Modal (Spec 8) */}
      <WhyRecommendationModal
        investigation={investigation}
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />

      {/* Resolution Confirmation Modal */}
      <ResolveIncidentModal
        incidentId={incident.incident_id}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirmResolve={handleResolveConfirm}
      />
    </div>
  );
};
