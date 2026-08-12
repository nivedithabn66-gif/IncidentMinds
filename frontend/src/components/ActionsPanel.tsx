import React, { useState } from 'react';
import { Wrench, Database, Server, RefreshCw, Layers, Cpu, Network, CheckCircle2, AlertOctagon, RotateCcw, Sparkles } from 'lucide-react';
import { Incident } from '../types';

interface ActionsPanelProps {
  incident: Incident;
  onExecuteAction: (actionId: string, actionName: string) => Promise<void>;
  onResolveIncident: (rootCause: string, resolution: string, lessonLearned: string) => Promise<void>;
  avoidActions?: string[];
  recommendedActions?: string[];
  isExecuting?: boolean;
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  incident,
  onExecuteAction,
  onResolveIncident,
  avoidActions = [],
  recommendedActions = [],
  isExecuting = false
}) => {
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [rootCause, setRootCause] = useState(
    incident.root_cause || "Database connection pool exhaustion under concurrent checkout traffic."
  );
  const [resolution, setResolution] = useState(
    incident.resolution || "Increased max database connection pool limit from 100 to 300 connections."
  );
  const [lessonLearned, setLessonLearned] = useState(
    incident.lesson_learned || "High API latency combined with high DB connection utilization should trigger database connection pool investigation before cache scaling."
  );
  const [resolving, setResolving] = useState(false);

  const availableActions = [
    {
      id: 'check_db_pool',
      name: 'Inspect DB Connection Pool',
      icon: Database,
      category: 'Database'
    },
    {
      id: 'increase_cache',
      name: 'Increase Redis Cache Size',
      icon: Layers,
      category: 'Caching'
    },
    {
      id: 'restart_service',
      name: 'Restart Service Containers',
      icon: RefreshCw,
      category: 'Infrastructure'
    },
    {
      id: 'rollback_deployment',
      name: 'Roll Back Deployment',
      icon: RotateCcw,
      category: 'Deployment'
    },
    {
      id: 'check_memory',
      name: 'Check Heap & Memory Metrics',
      icon: Cpu,
      category: 'Monitoring'
    },
    {
      id: 'inspect_network',
      name: 'Inspect Egress Network Proxy',
      icon: Network,
      category: 'Network'
    }
  ];

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolving(true);
    try {
      await onResolveIncident(rootCause, resolution, lessonLearned);
      setShowResolveModal(false);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border im-border im-bg-surface2 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b im-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold im-text-primary">Simulate Investigation Actions</h3>
            <p className="text-xs im-text-muted">Execute SRE actions to test system behavior and record results</p>
          </div>
        </div>

        {incident.status !== 'resolved' && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 im-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolve & Store Memory
          </button>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {availableActions.map((act) => {
          const Icon = act.icon;
          const isAvoided = avoidActions.some(
            (a) => a.toLowerCase().includes(act.name.toLowerCase()) || a.toLowerCase().includes(act.id)
          );
          const isRecommended = recommendedActions.some(
            (r) => r.toLowerCase().includes(act.id) || r.toLowerCase().includes(act.name.toLowerCase())
          );

          return (
            <button
              key={act.id}
              onClick={() => onExecuteAction(act.id, act.name)}
              disabled={isExecuting || incident.status === 'resolved'}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isRecommended
                  ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-900/40 ring-1 ring-emerald-500/30'
                  : isAvoided
                  ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/10 opacity-80'
                  : 'im-bg-code im-border hover:im-bg-badge hover:im-border'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <Icon className={`h-4 w-4 ${isRecommended ? 'text-emerald-600' : isAvoided ? 'text-rose-500' : 'im-text-muted'}`} />
                
                {isRecommended && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                    RECOMMENDED
                  </span>
                )}

                {isAvoided && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                    <AlertOctagon className="h-2.5 w-2.5 text-rose-500" />
                    FAILED BEFORE
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold im-text-primary block mb-0.5">{act.name}</span>
                <span className="text-[10px] im-text-muted">{act.category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Resolve Incident Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="im-bg-surface2 border im-border rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold im-text-primary mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Resolve Incident & Retain in Hindsight
            </h3>
            <p className="text-xs im-text-muted mb-4">
              Recording this resolution will store the root cause, successful fix, and SRE lesson into Hindsight long-term memory.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold im-text-secondary block mb-1">Confirmed Root Cause</label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  rows={2}
                  required
                  className="w-full im-bg-code border im-border rounded-xl p-2.5 text-xs im-text-primary focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold im-text-secondary block mb-1">Resolution Applied</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={2}
                  required
                  className="w-full im-bg-code border im-border rounded-xl p-2.5 text-xs im-text-primary focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold im-text-secondary block mb-1">SRE Lesson Learned for Hindsight</label>
                <textarea
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  rows={2}
                  required
                  className="w-full im-bg-code border im-border rounded-xl p-2.5 text-xs im-text-primary focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t im-border">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs im-text-muted hover:im-text-primary hover:im-bg-badge"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 im-text-primary shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  {resolving ? 'Retaining in Hindsight...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
