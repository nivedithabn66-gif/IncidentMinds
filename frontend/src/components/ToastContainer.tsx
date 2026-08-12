import React from 'react';
import { Brain, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'memory';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl im-bg-input/95 border im-border/80 shadow-2xl backdrop-blur-md text-xs font-sans transition-all duration-300 animate-slide-up"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'memory' && (
                <div className="p-1 rounded bg-purple-500/20 text-purple-600 border border-purple-500/30">
                  <Brain className="h-4 w-4" />
                </div>
              )}
              {toast.type === 'success' && (
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="p-1 rounded bg-amber-500/20 text-amber-600 border border-amber-500/30">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="p-1 rounded bg-blue-500/20 text-blue-600 border border-blue-500/30">
                  <Info className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="font-semibold im-text-primary">{toast.title}</div>
              <div className="im-text-muted mt-0.5">{toast.message}</div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="im-text-faint hover:im-text-secondary p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
