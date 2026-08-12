import React from 'react';
import { AlertCircle, Clock, Server, CheckCircle2, ChevronRight, Activity, Cpu, Database, MemoryStick } from 'lucide-react';
import { Incident } from '../types';

interface IncidentCardProps {
  incident: Incident;
  isSelected: boolean;
  onSelect: () => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected,
  onSelect
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
            CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30">
            WARNING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-600 border border-blue-500/30">
            INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-500 border border-rose-500/40">
            Active Alert
          </span>
        );
      case 'investigating':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-600 border border-blue-500/40">
            Investigating
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`glass-panel rounded-xl p-4 border transition-all cursor-pointer hover:border-blue-500/50 ${
        isSelected
          ? 'border-blue-500 im-bg-surface2 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/10'
          : 'im-border hover:im-bg-surface2'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold im-text-muted im-bg-code px-2 py-0.5 rounded border im-border">
            {incident.incident_id}
          </span>
          {getSeverityBadge(incident.severity)}
        </div>
        {getStatusBadge(incident.status)}
      </div>

      <h3 className="text-sm font-bold im-text-primary mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {incident.title}
      </h3>

      <div className="flex items-center gap-4 text-xs im-text-muted mb-3">
        <div className="flex items-center gap-1">
          <Server className="h-3.5 w-3.5 im-text-faint" />
          <span className="font-mono">{incident.service}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 im-text-faint" />
          <span>{new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Metrics pills */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono im-bg-code p-2 rounded-lg border im-border mb-3">
        {incident.metrics.latency_sec !== undefined && (
          <div className="flex items-center gap-1 text-amber-600">
            <Activity className="h-3 w-3 text-amber-600" />
            <span>{incident.metrics.latency_sec}s</span>
          </div>
        )}
        {incident.metrics.db_conn_pct !== undefined && (
          <div className="flex items-center gap-1 text-rose-500">
            <Database className="h-3 w-3 text-rose-500" />
            <span>DB {incident.metrics.db_conn_pct}%</span>
          </div>
        )}
        {incident.metrics.error_rate_pct !== undefined && (
          <div className="flex items-center gap-1 text-rose-500">
            <AlertCircle className="h-3 w-3 text-rose-500" />
            <span>Err {incident.metrics.error_rate_pct}%</span>
          </div>
        )}
      </div>

      {/* Failed vs Successful attempts counts */}
      <div className="flex items-center justify-between text-[11px] im-text-muted pt-2 border-t im-border/60">
        <div className="flex items-center gap-3">
          {incident.failed_attempts.length > 0 && (
            <span className="text-rose-500 font-medium">
              {incident.failed_attempts.length} Failed attempt{incident.failed_attempts.length > 1 ? 's' : ''}
            </span>
          )}
          {incident.successful_actions.length > 0 && (
            <span className="text-emerald-600 font-medium">
              {incident.successful_actions.length} Successful fix
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-blue-600 font-medium">
          Inspect <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};
