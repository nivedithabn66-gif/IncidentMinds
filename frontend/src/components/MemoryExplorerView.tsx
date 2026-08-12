import React, { useState } from 'react';
import { Brain, Search, Database, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { MemoryRecallResult } from '../types';
import { FullIncidentModal } from './FullIncidentModal';

interface MemoryExplorerViewProps {
  onSearchMemory: (query: string) => Promise<MemoryRecallResult[]>;
}

const DEFAULT_MEMORIES: MemoryRecallResult[] = [
  {
    memory_id: 'mem_INC-1042', incident_id: 'INC-1042',
    title: 'Incident INC-1042: High Latency & DB Saturation',
    service: 'checkout-service', similarity_score: 0.94,
    relevance_label: '94% High Similarity Postmortem',
    matched_symptoms: ['API latency > 4.5s', 'DB connection pool 98%'],
    failed_approaches: ['Increase Redis Cache Size', 'Restart API Service Containers'],
    successful_approaches: ['Inspect DB Connection Pool', 'Expand pool limit from 100 to 300'],
    root_cause: 'Database connection pool exhaustion under high concurrent load.',
    resolution: 'Expanded database pool limit from 100 to 300 connections.',
    lesson_learned: 'High API latency + high DB connection utilization (>95%) should trigger DB connection pool inspection before cache scaling.',
    match_rationale: 'Identical symptoms and database saturation pattern.',
    timestamp: '2026-08-01T14:30:00'
  },
  {
    memory_id: 'mem_INC-1011', incident_id: 'INC-1011',
    title: 'Incident INC-1011: Auth Gateway JWT Key Rotation Failure',
    service: 'auth-gateway', similarity_score: 0.82,
    relevance_label: '82% Relevance Match',
    matched_symptoms: ['HTTP 401 Auth Spikes', 'JWT Validation Errors'],
    failed_approaches: ['Flush Redis Cache', 'Scale Auth Pod Replicas'],
    successful_approaches: ['Rollback JWT Public Key Secret Deployment'],
    root_cause: 'Mismatched RS256 public key secret deployed during automated key rotation.',
    resolution: 'Rolled back auth secret deployment.',
    lesson_learned: 'HTTP 401 authorization spikes following secret deployment indicate key sync mismatch, not pod replica exhaustion.',
    match_rationale: 'Auth failure pattern.',
    timestamp: '2026-07-28T09:15:00'
  },
  {
    memory_id: 'mem_INC-0988', incident_id: 'INC-0988',
    title: 'Incident INC-0988: Payment Processing Gateway Timeout',
    service: 'payment-processor', similarity_score: 0.76,
    relevance_label: '76% Match',
    matched_symptoms: ['Payment Timeout > 10s', 'Stripe Webhook Backlog'],
    failed_approaches: ['Increase HTTP Request Timeout to 30s'],
    successful_approaches: ['Restart Payment Gateway Workers & Purge Queue Lock'],
    root_cause: 'Deadlocked Redis queue worker lock on payment callback listener.',
    resolution: 'Cleared Redis callback lock and restarted async worker queue.',
    lesson_learned: 'Increasing request timeout masks background worker deadlocks; inspect queue locks immediately.',
    match_rationale: 'Payment timeout history.',
    timestamp: '2026-07-15T18:20:00'
  }
];

export const MemoryExplorerView: React.FC<MemoryExplorerViewProps> = ({ onSearchMemory }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [memories, setMemories] = useState<MemoryRecallResult[]>(DEFAULT_MEMORIES);
  const [isSearching, setIsSearching] = useState(false);
  const [activeModalMemory, setActiveModalMemory] = useState<MemoryRecallResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setMemories(DEFAULT_MEMORIES); return; }
    setIsSearching(true);
    try {
      const results = await onSearchMemory(searchQuery);
      setMemories(results?.length > 0 ? results : DEFAULT_MEMORIES.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.root_cause.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } catch (err) { console.error('Search memory error:', err); }
    finally { setIsSearching(false); }
  };

  const filteredMemories = memories.filter(m => selectedService === 'all' || m.service === selectedService);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl im-bg-card border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold im-text-primary">Memory Explorer</h2>
          </div>
          <p className="text-xs im-text-muted mt-1 max-w-xl">
            Searchable historical incident memories retained by Hindsight. Filter by service, incident type, or root causes.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-purple-600 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
          <Database className="h-4 w-4" />
          <span>{filteredMemories.length} Memories Indexed</span>
        </div>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-3 im-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents, root causes, failed approaches..."
            className="w-full im-bg-input border im-border rounded-xl pl-10 pr-4 py-2.5 text-xs im-text-primary focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="im-bg-input border im-border rounded-xl px-3 py-2.5 text-xs im-text-primary focus:outline-none font-mono"
          >
            <option value="all">All Services</option>
            <option value="checkout-service">checkout-service</option>
            <option value="auth-gateway">auth-gateway</option>
            <option value="payment-processor">payment-processor</option>
          </select>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 im-text-primary rounded-xl font-medium text-xs shadow-lg transition-all"
          >
            {isSearching ? 'Searching...' : 'Search Hindsight'}
          </button>
        </div>
      </form>

      {/* Memory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.memory_id}
            onClick={() => setActiveModalMemory(mem)}
            className="p-5 rounded-2xl im-bg-card border im-border hover:border-purple-500/40 cursor-pointer transition-all duration-200 space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-600">{mem.incident_id}</span>
                <span className="text-[10px] font-mono uppercase im-bg-badge im-text-muted px-2 py-0.5 rounded border im-border">
                  {mem.service}
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-600 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                {mem.relevance_label || 'High Relevance'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold im-text-secondary group-hover:text-purple-600 transition-colors">
                {mem.title}
              </h3>
              <p className="text-xs im-text-muted mt-1 line-clamp-2">{mem.root_cause}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Failed: {mem.failed_approaches[0]}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Fix: {mem.successful_approaches[0]}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-purple-700 italic">
              "{mem.lesson_learned}"
            </div>

            <div className="pt-2 border-t im-border flex justify-end" style={{ borderStyle: 'solid' }}>
              <span className="text-xs text-purple-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect Full Postmortem <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <FullIncidentModal
        memory={activeModalMemory}
        isOpen={activeModalMemory !== null}
        onClose={() => setActiveModalMemory(null)}
      />
    </div>
  );
};
