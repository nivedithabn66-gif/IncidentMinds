import React from 'react';
import { Brain, ShieldAlert, Database, Cpu, Layers, CheckCircle2, GitBranch } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-[var(--bg-surface2)] via-[var(--bg-surface2)] to-blue-950/60 border im-border space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <Brain className="h-7 w-7 im-text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold im-text-primary">IncidentMind</h2>
            <p className="text-xs text-blue-600 font-mono">AI SRE Teammate with Long-Term Memory (Hindsight by Vectorize)</p>
          </div>
        </div>

        <p className="text-xs im-text-secondary leading-relaxed font-sans">
          IncidentMind is an enterprise AI Site Reliability Engineering platform that retains past outage postmortems, failed troubleshooting attempts, and successful resolutions. Unlike generic LLM chatbots that evaluate incidents in isolation, IncidentMind queries its long-term vector memory to avoid past mistakes and accelerate mean-time-to-resolution (MTTR).
        </p>
      </div>

      {/* Core Loop Workflow */}
      <div className="p-6 rounded-2xl im-bg-surface border im-border space-y-4">
        <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
          <GitBranch className="h-4 w-4 text-purple-600" />
          The Hindsight Learning Loop Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl im-bg-surface2 border im-border space-y-1">
            <span className="text-blue-600 font-bold block text-[11px]">1. NEW INCIDENT</span>
            <p className="im-text-muted text-[11px]">Telemetry alert triggered with symptoms & metrics.</p>
          </div>

          <div className="p-3 rounded-xl im-bg-surface2 border im-border space-y-1">
            <span className="text-purple-600 font-bold block text-[11px]">2. RECALL HISTORY</span>
            <p className="im-text-muted text-[11px]">Hindsight queries vector bank for similar symptoms.</p>
          </div>

          <div className="p-3 rounded-xl im-bg-surface2 border im-border space-y-1">
            <span className="text-amber-600 font-bold block text-[11px]">3. AVOID FAILURES</span>
            <p className="im-text-muted text-[11px]">Suppresses actions that failed in previous incidents.</p>
          </div>

          <div className="p-3 rounded-xl im-bg-surface2 border im-border space-y-1">
            <span className="text-emerald-600 font-bold block text-[11px]">4. RETAIN MEMORY</span>
            <p className="im-text-muted text-[11px]">Postmortem experience stored for future incidents.</p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-3">
          <h4 className="font-mono text-sm font-bold im-text-primary flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-600" />
            Backend & Hindsight SDK Integration
          </h4>
          <ul className="space-y-2 im-text-secondary font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>FastAPI backend API with Pydantic v2 schemas</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Official Hindsight Client SDK (`hindsight-client`) integration</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Local vector-semantic search fallback engine</span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-3">
          <h4 className="font-mono text-sm font-bold im-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            Frontend & Visual Architecture
          </h4>
          <ul className="space-y-2 im-text-secondary font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>React 18 + Vite + TypeScript build system</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Enterprise dark mode styling with Lucide icons</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>High information density observability dashboard layout</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
