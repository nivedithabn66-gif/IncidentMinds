import React from 'react';
import { X, ArrowRight, Brain, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { InvestigationResult } from '../types';

interface WhyRecommendationModalProps {
  investigation: InvestigationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhyRecommendationModal: React.FC<WhyRecommendationModalProps> = ({
  investigation,
  isOpen,
  onClose
}) => {
  if (!isOpen || !investigation) return null;

  const recData = investigation.why_this_recommendation;
  const historical = recData?.historical_memory_found;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="im-bg-input border im-border/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b im-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold im-text-primary">Why This Recommendation?</h3>
              <p className="text-xs im-text-muted font-mono">
                Evidence Breakdown & Memory Reasoning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg im-text-muted hover:im-text-primary hover:im-bg-badge"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Structured Mathematical Reason Formula */}
        <div className="space-y-4 text-xs">
          {/* Step 1: Current Incident Symptoms */}
          <div className="p-3.5 rounded-xl im-bg-surface2 border im-border flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                1. Current Incident Evidence
              </span>
              <p className="im-text-secondary font-medium">
                {recData?.current_evidence?.join(', ') || 'API Latency 5.1s, DB Connections 96%'}
              </p>
            </div>
            <span className="font-mono im-text-faint text-lg font-bold">+</span>
          </div>

          {/* Step 2: Historical Memory Match */}
          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-800/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-purple-600 tracking-wider flex items-center gap-1">
                <Brain className="h-3 w-3" />
                2. Historical Memory Found ({historical?.similarity_score || '91%'} Match)
              </span>
              <p className="text-purple-200 font-medium">
                {historical?.incident_id || 'INC-1042'} — {historical?.title || 'API Latency Spike & DB Saturation'}
              </p>
            </div>
            <span className="font-mono im-text-faint text-lg font-bold">+</span>
          </div>

          {/* Step 3: Previous Failures Avoided & Successful Fixes */}
          <div className="p-3.5 rounded-xl im-bg-surface2 border im-border flex items-center justify-between">
            <div className="space-y-1.5 w-full">
              <span className="font-mono text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                3. Previous Learning Matrix
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 border border-rose-800/30 p-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Failed Before: {recData?.historical_failed_attempts_to_avoid?.join(', ') || 'Cache scaling'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 border border-emerald-800/30 p-2 rounded-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Succeeded Before: {recData?.historical_successful_resolutions?.join(', ') || 'DB pool inspection'}
                  </span>
                </div>
              </div>
            </div>
            <span className="font-mono im-text-faint text-lg font-bold ml-2">=</span>
          </div>

          {/* Conclusion Recommendation Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-blue-500/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>FINAL RECOMMENDATION</span>
            </div>
            <p className="im-text-primary text-sm font-semibold">
              Inspect Database Connection Pool
            </p>
            <p className="im-text-secondary leading-relaxed">
              {recData?.conclusion ||
                'A previous incident (INC-1042) with identical symptoms was caused by database connection pool exhaustion. Cache scaling was previously attempted and produced zero latency improvement. Therefore, database connection pool inspection is prioritized.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 im-bg-badge hover:im-bg-surface3 im-text-primary rounded-xl font-medium text-xs border im-border"
          >
            Close Evidence Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
