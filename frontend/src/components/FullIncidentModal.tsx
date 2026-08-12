import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, FileText, Database, Server, Clock } from 'lucide-react';
import { MemoryRecallResult } from '../types';

interface FullIncidentModalProps {
  memory: MemoryRecallResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FullIncidentModal: React.FC<FullIncidentModalProps> = ({
  memory,
  isOpen,
  onClose
}) => {
  if (!isOpen || !memory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="im-bg-input border im-border/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b im-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold im-text-primary">{memory.incident_id}</h3>
                <span className="text-[10px] font-mono uppercase im-bg-badge text-purple-600 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  {memory.service}
                </span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  RESOLVED
                </span>
              </div>
              <p className="text-xs im-text-muted font-mono mt-0.5">{memory.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg im-text-muted hover:im-text-primary hover:im-bg-badge"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Retained Memory Information Grid */}
        <div className="space-y-4 text-xs">
          {/* Symptoms List */}
          <div className="p-4 rounded-xl im-bg-surface2 border im-border space-y-2">
            <h4 className="font-mono im-text-muted font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              Observed Symptoms
            </h4>
            <div className="flex flex-wrap gap-2">
              {(memory.symptoms || memory.matched_symptoms || ['API latency > 4.5s', 'DB connection utilization 98%']).map((sym, idx) => (
                <span key={idx} className="im-bg-badge border im-border im-text-secondary px-2.5 py-1 rounded-lg">
                  {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Previous Failures vs Successful Fix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Failed Approaches */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-900/40 space-y-2">
              <h4 className="font-mono text-rose-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Previous Failed Approaches
              </h4>
              <ul className="space-y-1.5 text-rose-200">
                {memory.failed_approaches.map((fail, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-rose-500/10 p-2 rounded-lg border border-rose-900/30">
                    <span className="text-rose-500 font-bold">❌</span>
                    <span>{fail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Successful Approaches */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-900/40 space-y-2">
              <h4 className="font-mono text-emerald-600 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Successful Resolution Path
              </h4>
              <ul className="space-y-1.5 text-emerald-200">
                {memory.successful_approaches.map((succ, idx) => (
                  <li key={idx} className="flex items-center gap-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-900/30">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{succ}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Root Cause & Resolution Breakdown */}
          <div className="p-4 rounded-xl im-bg-surface2 border im-border space-y-3">
            <div>
              <span className="font-mono text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Root Cause Analysis
              </span>
              <p className="im-text-secondary leading-relaxed font-sans">{memory.root_cause}</p>
            </div>

            <div className="pt-2 border-t im-border">
              <span className="font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Resolution Strategy Executed
              </span>
              <p className="im-text-secondary leading-relaxed font-sans">{memory.resolution}</p>
            </div>
          </div>

          {/* Retained SRE Postmortem Lesson */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/40 space-y-1.5">
            <span className="font-mono text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-purple-600" />
              Retained SRE Postmortem Lesson
            </span>
            <p className="text-purple-100 font-medium italic text-sm leading-relaxed">
              "{memory.lesson_learned}"
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-2 border-t im-border">
          <button
            onClick={onClose}
            className="px-4 py-2 im-bg-badge hover:im-bg-surface3 im-text-primary rounded-xl font-medium text-xs border im-border"
          >
            Close Postmortem Details
          </button>
        </div>
      </div>
    </div>
  );
};
