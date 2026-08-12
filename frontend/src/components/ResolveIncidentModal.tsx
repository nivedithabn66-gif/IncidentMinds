import React, { useState } from 'react';
import { X, CheckCircle2, Brain, Sparkles } from 'lucide-react';

interface ResolveIncidentModalProps {
  incidentId: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmResolve: (rootCause: string, resolution: string, lessonLearned: string) => Promise<void>;
}

export const ResolveIncidentModal: React.FC<ResolveIncidentModalProps> = ({
  incidentId,
  isOpen,
  onClose,
  onConfirmResolve
}) => {
  const [rootCause, setRootCause] = useState(
    'Database connection pool exhaustion caused by high concurrent request volume.'
  );
  const [resolution, setResolution] = useState(
    'Expanded max database connection pool limit to 300 connections and adjusted connection queue timeout.'
  );
  const [lessonLearned, setLessonLearned] = useState(
    'High API response latency combined with high DB connection utilization (>95%) requires immediate DB connection pool inspection before cache scaling.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmResolve(rootCause, resolution, lessonLearned);
      onClose();
    } catch (err) {
      console.error('Failed submitting resolution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="im-bg-input border im-border/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b im-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold im-text-primary">Resolve Incident {incidentId}</h3>
              <p className="text-xs im-text-muted font-mono">
                Store experience into Hindsight long-term memory bank
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

        {/* Resolution Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block im-text-secondary font-medium mb-1 font-mono text-[11px]">
              Confirmed Root Cause
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              required
              className="w-full im-bg-surface2 border im-border rounded-xl p-2.5 im-text-secondary focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="block im-text-secondary font-medium mb-1 font-mono text-[11px]">
              Resolution Action Taken
            </label>
            <textarea
              rows={2}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              required
              className="w-full im-bg-surface2 border im-border rounded-xl p-2.5 im-text-secondary focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div>
            <label className="block im-text-secondary font-medium mb-1 font-mono text-[11px]">
              SRE Lesson Learned (Retained for Future Incidents)
            </label>
            <textarea
              rows={2}
              value={lessonLearned}
              onChange={(e) => setLessonLearned(e.target.value)}
              required
              className="w-full im-bg-surface2 border im-border rounded-xl p-2.5 im-text-secondary focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>

          {/* Callout Info Banner */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-800/40 flex items-center gap-2.5 text-purple-200">
            <Brain className="h-4 w-4 text-purple-600 shrink-0" />
            <span>
              Submitting will retain this postmortem experience in Hindsight so IncidentMind avoids this issue and acts faster in future incidents.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 im-bg-badge hover:im-bg-surface3 im-text-secondary rounded-xl font-medium border im-border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 im-text-primary rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all"
            >
              {isSubmitting ? (
                <span>Storing in Hindsight...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Resolve & Store Memory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
