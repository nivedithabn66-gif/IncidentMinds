import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  FileText,
  Brain,
  TrendingUp,
  Zap,
  PlaySquare,
  Info,
  ChevronRight,
  Database,
  Cpu
} from 'lucide-react';
import { MemoryStatus } from '../types';

export type ActiveTab =
  | 'overview'
  | 'incidents'
  | 'real_incident'
  | 'memory'
  | 'learning'
  | 'simulator'
  | 'demo'
  | 'about';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeIncidentsCount: number;
  memoryStatus: MemoryStatus | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeIncidentsCount,
  memoryStatus
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} Active` : undefined,
      badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30'
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: ShieldAlert,
      badge: activeIncidentsCount > 0 ? String(activeIncidentsCount) : undefined,
      badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30'
    },
    {
      id: 'real_incident',
      label: 'Real Incident',
      icon: FileText,
      badge: 'NEW',
      badgeClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30'
    },
    {
      id: 'memory',
      label: 'Memory Explorer',
      icon: Brain,
      badge: memoryStatus ? String(memoryStatus.total_incident_memories) : undefined,
      badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30'
    },
    {
      id: 'learning',
      label: 'Learning',
      icon: TrendingUp
    },
    {
      id: 'simulator',
      label: 'Simulator',
      icon: Zap
    },
    {
      id: 'demo',
      label: 'Demo Mode',
      icon: PlaySquare,
      badge: 'HACKATHON',
      badgeClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 font-mono text-[10px]'
    },
    {
      id: 'about',
      label: 'About',
      icon: Info
    }
  ];

  return (
    <aside
      className="w-64 im-sidebar border-r im-border-subtle flex flex-col justify-between shrink-0 select-none"
      style={{ borderStyle: 'solid', transition: 'background-color 0.25s, border-color 0.25s' }}
    >
      <div>
        {/* Logo */}
        <div className="p-5 border-b im-border-subtle flex items-center gap-3" style={{ borderStyle: 'solid' }}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg border border-blue-400/30">
            <Brain className="h-6 w-6 im-text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight im-text-primary">IncidentMind</h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/30">
                SRE
              </span>
            </div>
            <p className="text-[11px] im-text-muted font-mono">Long-Term Memory AI</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider im-text-faint">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group im-nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-500' : 'im-text-muted'}`}
                  />
                  <span className="im-text-secondary group-[.active]:text-blue-500">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (item as any).badgeClass && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${(item as any).badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-500" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer status */}
      <div className="p-4 m-3 rounded-xl im-bg-surface2 border im-border text-xs space-y-2 font-mono" style={{ borderStyle: 'solid' }}>
        <div className="flex items-center justify-between im-text-muted">
          <span className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-purple-500" />
            Hindsight DB
          </span>
          <span className="text-[10px] text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            CONNECTED
          </span>
        </div>
        <div className="flex items-center justify-between im-text-muted">
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-blue-500" />
            Agent Engine
          </span>
          <span className="text-[10px] text-blue-600 bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 rounded">
            READY
          </span>
        </div>
        <div className="pt-2 border-t im-divider text-[10px] im-text-faint flex justify-between" style={{ borderStyle: 'solid' }}>
          <span>Env: DEMO</span>
          <span>v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
