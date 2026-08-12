import React from 'react';
import { TimelineEvent } from '../types';
import { Activity, CheckCircle2, AlertTriangle, Brain, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  return (
    <div className="p-6 rounded-2xl im-bg-surface border im-border space-y-4">
      <div className="flex items-center justify-between border-b im-border pb-3">
        <h3 className="text-sm font-bold im-text-primary flex items-center gap-2 font-mono">
          <Clock className="h-4 w-4 text-blue-600" />
          Investigation Timeline & Audit Trail
        </h3>
        <span className="text-xs im-text-muted font-mono">{timeline.length} Events Logged</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:im-bg-badge">
        {timeline.map((item, idx) => {
          const isAction = item.event_type === 'action';
          const isResolution = item.event_type === 'resolution';
          const isDetection = item.event_type === 'detection';
          const isMemory = item.event_type === 'memory';

          const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={item.id || idx} className="relative flex items-start gap-4 text-xs group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center im-bg-surface ${
                  isResolution
                    ? 'border-emerald-500 text-emerald-600'
                    : isAction
                    ? 'border-blue-500 text-blue-600'
                    : isDetection
                    ? 'border-rose-500 text-rose-500'
                    : 'border-purple-500 text-purple-600'
                }`}
              >
                {isResolution && <CheckCircle2 className="h-3 w-3" />}
                {isAction && <Activity className="h-3 w-3" />}
                {isDetection && <AlertTriangle className="h-3 w-3" />}
                {isMemory && <Brain className="h-3 w-3" />}
                {!isResolution && !isAction && !isDetection && !isMemory && <Sparkles className="h-3 w-3" />}
              </div>

              {/* Event Details */}
              <div className="flex-1 p-3.5 rounded-xl im-bg-surface2 border im-border space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold im-text-primary text-xs">{item.title}</span>
                  <span className="text-[10px] im-text-faint">{timeStr}</span>
                </div>

                <p className="im-text-secondary font-sans leading-relaxed text-[11px]">{item.description}</p>

                {item.metadata?.reason && (
                  <div className="mt-2 text-[10px] font-mono im-text-muted im-bg-code p-2 rounded border im-border">
                    Reason: {item.metadata.reason}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
