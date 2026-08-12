import React from 'react';
import { HelpCircle, AlertOctagon, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import { InvestigationResult } from '../types';

interface ExplainableRecPanelProps {
  investigation: InvestigationResult | null;
}

export const ExplainableRecPanel: React.FC<ExplainableRecPanelProps> = ({
  investigation
}) => {
  if (!investigation || !investigation.why_this_recommendation) return null;

  const why = investigation.why_this_recommendation;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-blue-500/30 im-bg-surface2 mb-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b im-border">
        <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold im-text-primary">Why this recommendation?</h3>
          <p className="text-xs im-text-muted">Explainable AI rationale connecting historical memory to current metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* Memory Match */}
        <div className="im-bg-code p-3 rounded-xl border im-border">
          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block mb-1">
            1. Historical Memory
          </span>
          <div className="text-xs font-bold im-text-primary font-mono">{why.historical_memory_found?.incident_id || 'INC-1042'}</div>
          <div className="text-[11px] im-text-muted mt-0.5">{why.historical_memory_found?.similarity_score || '91%'} similarity</div>
        </div>

        {/* Failed Attempt */}
        <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
          <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider flex items-center gap-1 mb-1">
            <AlertOctagon className="h-3 w-3" />
            2. Historical Failed Attempt
          </span>
          <div className="text-xs font-bold text-rose-500 font-mono">
            {why.historical_failed_attempts_to_avoid?.join(', ') || 'Cache scaling'}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-0.5 font-medium">FILTERED OUT & AVOIDED</div>
        </div>

        {/* Successful Resolution */}
        <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1">
            <CheckCircle2 className="h-3 w-3" />
            3. Historical Successful Fix
          </span>
          <div className="text-xs font-bold text-emerald-600 font-mono">
            {why.historical_successful_resolutions?.join(', ') || 'DB connection pool inspection'}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">PRIORITIZED FOR ACTION</div>
        </div>

        {/* Current Evidence */}
        <div className="im-bg-code p-3 rounded-xl border im-border">
          <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1 mb-1">
            <Search className="h-3 w-3" />
            4. Current Evidence
          </span>
          <div className="text-[11px] font-mono im-text-secondary">
            {why.current_evidence?.[1] || why.current_evidence?.[0] || 'API Latency 5.1s'}
          </div>
        </div>
      </div>

      {/* Conclusion Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-950 p-3.5 rounded-xl border border-blue-500/20 text-xs im-text-secondary flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-600 mr-1">Agent Rationale Conclusion:</span>
          <span>{why.conclusion}</span>
        </div>
      </div>
    </div>
  );
};
