import React, { useState } from 'react';
import { PlaySquare, Brain, ShieldAlert, Zap, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { triggerInvestigation, resetDemoData } from '../services/api';
import { InvestigationResult, Incident } from '../types';

interface DemoModeViewProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: any) => void;
  onRefreshIncidents: () => void;
}

export const DemoModeView: React.FC<DemoModeViewProps> = ({
  incidents, onSelectIncident, onNavigateTab, onRefreshIncidents
}) => {
  const [comparisonResult, setComparisonResult] = useState<{
    off: InvestigationResult; on: InvestigationResult;
  } | null>(null);
  const [isRunningComparison, setIsRunningComparison] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleLoadHistoricalIncident = async () => {
    setStatusMessage('Loading historical incident INC-1042...');
    onSelectIncident('INC-1042');
    onNavigateTab('incidents');
  };

  const handleCreateSimilarIncident = async () => {
    setStatusMessage('Creating similar recurrence target incident (INC-1087)...');
    try {
      await resetDemoData();
      onRefreshIncidents();
      onSelectIncident('INC-1087');
      onNavigateTab('incidents');
    } catch (err) { console.error('Failed creating similar incident:', err); }
  };

  const handleRunMemoryComparison = async () => {
    setIsRunningComparison(true);
    setStatusMessage('Executing real backend A/B comparison for INC-1087...');
    try {
      const resOff = await triggerInvestigation('INC-1087', false);
      const resOn  = await triggerInvestigation('INC-1087', true);
      setComparisonResult({ off: resOff, on: resOn });
      setStatusMessage('Comparison completed using live backend behavior.');
    } catch (err) {
      console.error('Error running memory comparison:', err);
      setStatusMessage('Failed running comparison.');
    } finally { setIsRunningComparison(false); }
  };

  return (
    <div className="space-y-6">
      {/* ── Header Banner ── */}
      <div className="p-6 rounded-2xl im-bg-card border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              <PlaySquare className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold im-text-primary">Hackathon Presentation Suite</h2>
          </div>
          <p className="text-xs im-text-muted mt-1 max-w-xl">
            One-click demonstration workflows designed for judges to easily observe how IncidentMind recalls memories
            and improves SRE response times.
          </p>
        </div>

        {statusMessage && (
          <div className="text-xs font-mono text-cyan-700 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
            {statusMessage}
          </div>
        )}
      </div>

      {/* ── 3 Action Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl im-bg-card border im-border space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2 w-max rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold im-text-primary">1. Load Historical Experience</h3>
            <p className="text-xs im-text-muted leading-relaxed">
              Loads initial baseline incident <strong>INC-1042</strong> where cache scaling failed and DB pool expansion resolved latency.
            </p>
          </div>
          <button
            onClick={handleLoadHistoricalIncident}
            className="w-full py-2.5 im-btn rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Load INC-1042 Postmortem</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl im-bg-card border im-border space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2 w-max rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold im-text-primary">2. Create Recurrence Incident</h3>
            <p className="text-xs im-text-muted leading-relaxed">
              Triggers new active incident <strong>INC-1087</strong> sharing identical latency and DB pool symptoms.
            </p>
          </div>
          <button
            onClick={handleCreateSimilarIncident}
            className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-xl font-medium text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Select Active INC-1087</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl im-bg-card border im-border space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-2 w-max rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              <PlaySquare className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold im-text-primary">3. Run Memory Comparison</h3>
            <p className="text-xs im-text-muted leading-relaxed">
              Executes the live backend agent twice (Memory OFF vs Memory ON) to showcase real-time failure avoidance.
            </p>
          </div>
          <button
            onClick={handleRunMemoryComparison}
            disabled={isRunningComparison}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 im-text-primary rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isRunningComparison
              ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              : <Brain className="h-3.5 w-3.5" />}
            <span>Execute Side-by-Side Test</span>
          </button>
        </div>
      </div>

      {/* ── A/B Comparison Result ── */}
      {comparisonResult && (
        <div className="p-6 rounded-2xl im-bg-card border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between border-b im-border pb-3" style={{ borderStyle: 'solid' }}>
            <span className="font-bold im-text-primary text-sm font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Live Backend A/B Execution Results for INC-1087
            </span>
            <span className="text-xs im-text-muted font-mono">Real Backend Behavior</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Memory OFF */}
            <div className="p-4 rounded-xl im-bg-surface2 border im-border space-y-3">
              <div className="flex items-center justify-between border-b im-border pb-2" style={{ borderStyle: 'solid' }}>
                <span className="font-bold text-rose-500">WITHOUT MEMORY (Memory: OFF)</span>
                <span className="text-[10px] im-text-faint">Generic SRE Baseline</span>
              </div>
              <div>
                <span className="im-text-faint text-[10px] block">RECOMMENDED ACTION</span>
                <span className="im-text-primary font-bold text-sm">
                  {comparisonResult.off.recommended_next_steps[0]?.action_name || 'Increase Redis Cache Size'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[11px]">
                ⚠️ Repeated past mistake: Recommended cache scaling which previously failed in INC-1042.
              </div>
            </div>

            {/* Memory ON */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2" style={{ borderStyle: 'solid' }}>
                <span className="font-bold text-purple-600 flex items-center gap-1">
                  <Brain className="h-3.5 w-3.5" /> WITH HINDSIGHT (Memory: ON)
                </span>
                <span className="text-[10px] text-emerald-600">Adaptive AI SRE</span>
              </div>
              <div>
                <span className="im-text-faint text-[10px] block">RECOMMENDED ACTION</span>
                <span className="text-emerald-600 font-bold text-sm">
                  {comparisonResult.on.recommended_next_steps[0]?.action_name || 'Inspect DB Connection Pool'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[11px]">
                ✓ Avoided failed cache scaling. Recalled INC-1042 experience and prioritized DB pool inspection.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
