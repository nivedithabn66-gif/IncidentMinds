import React from 'react';
import { Brain, AlertCircle, CheckCircle2, ArrowDown, Clock, ShieldCheck, Zap } from 'lucide-react';

export const BeforeAfterComparison: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--bg-surface2)] via-[var(--bg-surface2)] to-blue-950/60 border im-border space-y-2">
        <h2 className="text-xl font-bold im-text-primary tracking-tight">
          What changes when IncidentMind remembers?
        </h2>
        <p className="text-xs im-text-muted">
          Side-by-side comparison contrasting standard un-assisted SRE response vs Hindsight memory-driven learning.
        </p>
      </div>

      {/* Side-by-Side Cards (Spec 12) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT CARD: Without Memory */}
        <div className="p-6 rounded-2xl im-bg-surface border border-rose-900/40 space-y-4 relative">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-500">Without Memory</h3>
                <p className="text-[10px] font-mono im-text-faint">Trial-and-Error SRE Response</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-800">
              MTTR ~ 45 Mins
            </span>
          </div>

          {/* Flowchart Steps */}
          <div className="space-y-3 font-mono text-xs im-text-secondary">
            <div className="p-3 rounded-xl im-bg-surface2 border im-border text-center">
              1. Current Incident Detected
            </div>
            <ArrowDown className="h-4 w-4 im-text-faint mx-auto" />

            <div className="p-3 rounded-xl im-bg-surface2 border im-border text-center text-rose-500">
              2. Generic Troubleshooting
            </div>
            <ArrowDown className="h-4 w-4 im-text-faint mx-auto" />

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-900/50 text-center text-rose-200">
              3. Repeated Failed Attempts (Cache Scaling, Restarts)
            </div>
            <ArrowDown className="h-4 w-4 im-text-faint mx-auto" />

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-800 text-center text-rose-100 font-bold">
              4. Longer Outage & High MTTR
            </div>
          </div>
        </div>

        {/* RIGHT CARD: With Hindsight Memory */}
        <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/40 space-y-4 relative shadow-xl shadow-purple-950/30">
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 border border-purple-500/30">
                <Brain className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-purple-600">With Hindsight Memory</h3>
                <p className="text-[10px] font-mono text-emerald-600">Adaptive AI SRE Agent</p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-800">
              MTTR ~ 3 Mins
            </span>
          </div>

          {/* Flowchart Steps */}
          <div className="space-y-3 font-mono text-xs im-text-secondary">
            <div className="p-3 rounded-xl im-bg-surface2 border im-border text-center">
              1. Current Incident Detected
            </div>
            <ArrowDown className="h-4 w-4 text-purple-600 mx-auto" />

            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-800 text-center text-purple-600 font-bold">
              2. Historical Experience Recalled (INC-1042 Found)
            </div>
            <ArrowDown className="h-4 w-4 text-purple-600 mx-auto" />

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-800 text-center text-emerald-600 font-bold">
              3. Failed Approaches Avoided (Cache Scaling Suppressed)
            </div>
            <ArrowDown className="h-4 w-4 text-purple-600 mx-auto" />

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center text-emerald-100 font-bold">
              4. Relevant Investigation Prioritized & New Experience Stored
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
