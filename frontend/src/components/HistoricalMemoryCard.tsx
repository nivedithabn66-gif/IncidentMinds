import React, { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle2, Sparkles, ExternalLink, Lightbulb, X, FileText } from 'lucide-react';
import { MemoryRecallItem } from '../types';
import { FullIncidentModal } from './FullIncidentModal';

interface HistoricalMemoryCardProps {
  memory: MemoryRecallItem;
}

export const HistoricalMemoryCard: React.FC<HistoricalMemoryCardProps> = ({ memory }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Visual Centerpiece Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-[var(--bg-surface)] to-[var(--bg-surface2)] border border-purple-500/40 shadow-xl shadow-purple-950/20 space-y-4 mb-6">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 border border-purple-500/30">
              <Brain className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600 block">
                🧠 RELEVANT HISTORICAL EXPERIENCE
              </span>
              <h4 className="text-base font-bold im-text-primary flex items-center gap-2">
                Historical Incident: <span className="font-mono text-purple-600">{memory.incident_id}</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-600 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {Math.round(memory.similarity_score * 100)}% Similarity
            </span>
          </div>
        </div>

        {/* Symptoms Matched */}
        <div className="p-3 rounded-xl im-bg-surface2 border im-border text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 im-text-secondary">
            <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="font-semibold im-text-muted">Symptoms Matched:</span>
            <span>{memory.matched_symptoms.join(', ') || 'API latency, High DB connections'}</span>
          </div>
        </div>

        {/* Previous Failures vs Successful Fix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Previous Failures */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-900/40 space-y-1.5">
            <span className="font-mono text-[10px] font-bold uppercase text-rose-500 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Previous Failed Approaches
            </span>
            <div className="font-mono text-rose-200 space-y-1 text-[11px]">
              {memory.failed_approaches.map((fail, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-rose-500 font-bold">❌</span>
                  <span>{fail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Successful Fix */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-900/40 space-y-1.5">
            <span className="font-mono text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Successful Investigation Fix
            </span>
            <div className="font-mono text-emerald-200 text-[11px]">
              {memory.successful_approaches.map((succ, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{succ}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Root Cause & Lesson */}
        <div className="p-3.5 rounded-xl im-bg-surface2 border im-border text-xs space-y-2">
          <div>
            <strong className="im-text-muted font-mono text-[10px] uppercase block mb-0.5">Root Cause:</strong>
            <span className="im-text-secondary">{memory.root_cause}</span>
          </div>

          <div className="pt-2 border-t im-border">
            <strong className="text-amber-600 font-mono text-[10px] uppercase flex items-center gap-1 mb-0.5">
              <Lightbulb className="h-3.5 w-3.5" /> Postmortem Lesson Retained:
            </strong>
            <span className="text-amber-200 italic">"{memory.lesson_learned}"</span>
          </div>
        </div>

        {/* View Full Incident Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 rounded-xl text-xs font-bold border border-purple-500/40 transition-all"
          >
            <span>View Full Incident Postmortem</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Full Incident Details Modal */}
      <FullIncidentModal
        memory={memory}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};
