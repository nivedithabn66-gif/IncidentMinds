import React from 'react';
import { Brain } from 'lucide-react';
import { MemoryRecallResult } from '../types';
import { HistoricalMemoryCard } from './HistoricalMemoryCard';

interface MemoryPanelProps {
  memoryResult: MemoryRecallResult | null;
  onViewHistoricalIncident?: (incidentId: string) => void;
  isLoading?: boolean;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  memoryResult,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 animate-pulse mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-lg bg-purple-500/20"></div>
          <div className="h-4 w-48 im-bg-badge rounded"></div>
        </div>
        <div className="h-16 im-bg-surface2 rounded-xl mb-3"></div>
        <div className="h-12 im-bg-surface2 rounded-xl"></div>
      </div>
    );
  }

  if (!memoryResult) {
    return (
      <div className="glass-panel rounded-2xl p-6 border im-border text-center mb-6">
        <Brain className="h-8 w-8 im-text-faint mx-auto mb-2" />
        <h4 className="text-sm font-semibold im-text-secondary">Memory Context Disabled or No Historical Matches</h4>
        <p className="text-xs im-text-faint mt-1">
          Toggle Memory ON in the top right to enable Hindsight memory recall.
        </p>
      </div>
    );
  }

  return <HistoricalMemoryCard memory={memoryResult} />;
};
