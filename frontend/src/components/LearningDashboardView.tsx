import React, { useEffect, useState } from 'react';
import { TrendingUp, Brain, AlertTriangle, CheckCircle2, Lightbulb, Search, Database, Clock } from 'lucide-react';
import { LearningSummary } from '../types';
import { fetchLearningHistory, fetchRecurringPatterns } from '../services/api';

interface LearningDashboardViewProps {
  summary: LearningSummary | null;
  onSearchMemory: (query: string) => Promise<any>;
}

export const LearningDashboardView: React.FC<LearningDashboardViewProps> = ({
  summary,
  onSearchMemory
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [historyLog, setHistoryLog] = useState<any[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<any[]>([]);

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      const [hist, pat] = await Promise.all([
        fetchLearningHistory(),
        fetchRecurringPatterns()
      ]);
      setHistoryLog(hist || []);
      setRecurringPatterns(pat || []);
    } catch (err) {
      console.error('Failed loading learning history:', err);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await onSearchMemory(query);
      setSearchResults(res || []);
    } catch (err) {
      console.error('Failed memory query:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-[var(--bg-surface2)] to-[var(--bg-surface2)] border border-purple-800/40 space-y-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-600 border border-purple-500/30">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 block">
              SYSTEMIC KNOWLEDGE ENGINE
            </span>
            <h2 className="text-2xl font-black im-text-primary tracking-tight">
              What IncidentMind Has Learned
            </h2>
          </div>
        </div>

        <p className="text-sm font-semibold text-purple-200 font-sans">
          "Every resolved incident becomes experience for the next one."
        </p>
        <p className="text-xs im-text-muted max-w-2xl leading-relaxed">
          Aggregated long-term intelligence discovered from postmortems stored in Hindsight memory.
        </p>
      </div>

      {/* 4 Main Learning Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Recurring Failure Patterns */}
        <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-3">
          <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
            <Brain className="h-4 w-4 text-purple-600" />
            Recurring Failure Patterns
          </h3>
          <p className="text-xs im-text-muted">Common symptom combinations indicating specific root causes.</p>

          <div className="space-y-2 text-xs">
            {recurringPatterns.map((pat, idx) => (
              <div key={pat.pattern_id || idx} className="p-3 rounded-xl im-bg-surface2 border im-border space-y-1">
                <span className="font-bold text-amber-600 font-mono">{pat.symptoms?.join(' + ') || pat.pattern_id}</span>
                <p className="im-text-secondary text-[11px]">→ {pat.common_root_cause}</p>
                <div className="flex items-center justify-between text-[10px] im-text-faint pt-1 font-mono">
                  <span>Occurrences: {pat.observed_occurrences}</span>
                  <span className="text-emerald-600">Fix: {pat.successful_strategy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Approaches That Often Fail */}
        <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-3">
          <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Approaches That Often Fail
          </h3>
          <p className="text-xs im-text-muted">Troubleshooting actions that consistently produced zero recovery.</p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-900/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-500 font-mono block">Increase Redis Cache Size</span>
                <span className="text-[10px] im-text-muted">Ineffective on DB pool saturation</span>
              </div>
              <span className="font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-800">
                Failed Attempts Penalized
              </span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-900/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-rose-500 font-mono block">Restart API Service Containers</span>
                <span className="text-[10px] im-text-muted">Temporary relief before re-exhaustion / stale secrets</span>
              </div>
              <span className="font-mono font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-800">
                Failed Attempts Penalized
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Strategies That Work */}
        <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-3">
          <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Strategies That Work
          </h3>
          <p className="text-xs im-text-muted">Proven investigation paths with verified MTTR reduction.</p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-900/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-600 font-mono block">Inspect Database Connection Pool</span>
                <span className="text-[10px] im-text-muted">Fast-tracks MTTR from 45m to 3m</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-800">
                Boosted Preference
              </span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-900/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-600 font-mono block">Inspect Auth JWT Keys & Secret Rotation</span>
                <span className="text-[10px] im-text-muted">Restores auth gateway within 90s</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-800">
                Boosted Preference
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Chronological Learning History Log (Section 16) */}
        <div className="p-5 rounded-2xl im-bg-surface border im-border space-y-3">
          <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
            <Clock className="h-4 w-4 text-amber-600" />
            Learning History Log
          </h3>
          <p className="text-xs im-text-muted">Chronological stream of postmortem lessons stored in Hindsight.</p>

          <div className="space-y-2 text-xs im-text-secondary max-h-56 overflow-y-auto pr-1">
            {historyLog.map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl im-bg-surface2 border im-border space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-purple-600">{log.incident_id} ({log.service})</span>
                  <span className="text-[10px] text-emerald-600">{log.confidence || '95%'}</span>
                </div>
                <p className="im-text-secondary italic text-[11px]">"{log.lesson}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Hindsight Query Box */}
      <div className="p-6 rounded-2xl im-bg-surface border im-border space-y-4">
        <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
          <Database className="h-4 w-4 text-purple-600" />
          Direct Vector Memory Query Engine
        </h3>

        <form onSubmit={handleQuery} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. database connection pool exhaustion latency or JWT secret rotation"
            className="flex-1 im-bg-surface2 border im-border rounded-xl px-4 py-2.5 text-xs im-text-secondary focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 im-text-primary font-bold rounded-xl text-xs shadow-lg shadow-purple-900/30"
          >
            {isSearching ? 'Querying Hindsight...' : 'Query Memory'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t im-border text-xs font-mono">
            {searchResults.map((res, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-purple-500/10 border border-purple-800/40 text-purple-200">
                <strong className="im-text-primary block mb-1">{res.incident_id || 'INC-1042'} Match</strong>
                <p className="im-text-secondary font-sans">{res.lesson_learned || res.root_cause}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
