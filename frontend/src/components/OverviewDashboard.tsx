import React from 'react';
import {
  ShieldAlert, Brain, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, ArrowUpRight, Server, Activity
} from 'lucide-react';
import { Incident, MemoryStatus } from '../types';

interface OverviewDashboardProps {
  incidents: Incident[];
  memoryStatus: MemoryStatus | null;
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  incidents, memoryStatus, onSelectIncident, onNavigateTab
}) => {
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* ── Hero Banner ── */}
      <div className="p-6 rounded-2xl im-bg-surface border im-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
           style={{ background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface2) 100%)' }}>
        <div>
          <h2 className="text-2xl font-extrabold im-text-primary tracking-tight">Good afternoon, Engineer</h2>
          <p className="text-xs im-text-muted mt-1 max-w-xl">
            Your AI SRE teammate is monitoring system health and learning from previous incidents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('incidents')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 im-text-primary rounded-xl font-medium text-xs shadow-lg transition-all"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Open Incident Queue</span>
          </button>
          <button
            onClick={() => onNavigateTab('demo')}
            className="flex items-center gap-2 px-4 py-2 im-btn rounded-xl font-medium text-xs transition-all"
          >
            <span>Launch Hackathon Demo</span>
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Active Incidents',       value: activeIncidents.length,                   sub: 'Requires SRE Action',   subColor: 'text-amber-500',  Icon: ShieldAlert,   ic: 'text-amber-500' },
          { label: 'Historical Incidents',   value: memoryStatus?.total_incident_memories||12, sub: 'Hindsight Memory',       subColor: 'text-purple-500', Icon: Brain,         ic: 'text-purple-500' },
          { label: 'Learned Patterns',       value: 4,                                         sub: 'Systemic Insights',     subColor: 'text-blue-500',   Icon: TrendingUp,    ic: 'text-blue-500' },
          { label: 'Failed Approaches',      value: memoryStatus?.failed_approaches_count||8,  sub: 'Explicitly Avoided',    subColor: 'text-rose-500',   Icon: AlertTriangle, ic: 'text-rose-500' },
          { label: 'Successful Resolutions', value: memoryStatus?.successful_fixes_count||14,  sub: 'Fast-Tracked',          subColor: 'text-emerald-500',Icon: CheckCircle2,  ic: 'text-emerald-500' },
        ].map(({ label, value, sub, subColor, Icon, ic }) => (
          <div key={label} className="p-4 rounded-xl im-bg-card border im-border space-y-2">
            <div className="flex items-center justify-between im-text-muted">
              <span className="text-xs font-mono font-medium">{label}</span>
              <Icon className={`h-4 w-4 ${ic}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black im-text-primary">{value}</span>
              <span className={`text-[10px] font-mono ${subColor}`}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Memory Intelligence ── */}
      <div className="p-5 rounded-2xl im-bg-card border im-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold im-text-primary">Memory Intelligence</h3>
          </div>
          <span className="text-[11px] font-mono text-purple-600 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
            Hindsight Engine Active
          </span>
        </div>

        <p className="text-xs im-text-muted leading-relaxed">
          IncidentMind uses long-term memory to incorporate previous incident experience into current investigations.
          When symptoms recur, past failed actions are suppressed while verified resolutions are prioritized.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
          {[
            { label: 'Recalled Experiences',        value: '12 Matched Postmortems',            color: 'im-text-secondary' },
            { label: 'Failed Approaches Avoided',   value: 'Cache scaling, Container restarts', color: 'text-rose-500' },
            { label: 'Successful Resolutions Reused',value: 'DB Pool Expansion (INC-1042)',      color: 'text-emerald-600' },
            { label: 'New Lessons Retained',        value: 'High DB utilization rule',          color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 rounded-xl im-bg-surface2 border im-border">
              <span className="im-text-faint text-[10px] font-mono block uppercase">{label}</span>
              <span className={`${color} font-bold mt-0.5 block`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Incidents Queue ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold im-text-primary flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Active Incidents Queue ({incidents.length})
          </h3>
          <span className="text-xs im-text-muted font-mono">Click card to investigate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incidents.map((inc) => (
            <div
              key={inc.incident_id}
              onClick={() => { onSelectIncident(inc.incident_id); onNavigateTab('incidents'); }}
              className="p-5 rounded-2xl im-bg-card border im-border hover:border-blue-500/50 cursor-pointer transition-all duration-200 group relative space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold im-text-primary">{inc.incident_id}</span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    inc.severity === 'critical'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  }`}>
                    {inc.severity}
                  </span>
                </div>

                <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                  inc.status === 'active'
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                    : inc.status === 'investigating'
                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                }`}>
                  {inc.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold im-text-secondary group-hover:text-blue-500 transition-colors">
                  {inc.title}
                </h4>
                <div className="flex items-center gap-2 text-xs im-text-muted mt-1 font-mono">
                  <Server className="h-3.5 w-3.5" />
                  <span>{inc.service}</span>
                </div>
              </div>

              <div className="pt-2 border-t im-border flex items-center justify-between text-xs im-text-muted" style={{ borderStyle: 'solid' }}>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Duration: 14m</span>
                </div>
                <span className="text-blue-500 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Investigate <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
