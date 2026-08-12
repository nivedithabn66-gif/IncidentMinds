import React from 'react';
import { Play, Sparkles, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Incident } from '../types';

interface DemoScenarioGuideProps {
  incidents: Incident[];
  onSelectIncident: (incidentId: string) => void;
  selectedIncidentId: string | null;
}

export const DemoScenarioGuide: React.FC<DemoScenarioGuideProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId
}) => {
  const incA = incidents.find((i) => i.incident_id === 'INC-1042');
  const incB = incidents.find((i) => i.incident_id === 'INC-1087');

  return (
    <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-[var(--bg-surface2)]/60 border border-blue-500/30 rounded-2xl p-5 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Primary Hackathon Demo Flow
            </span>
            <span className="text-xs im-text-muted">Visualizing Remember → Learn → Adapt</span>
          </div>
          <h3 className="text-base font-semibold im-text-primary">
            Incident Recurrence & Adaptive Resolution Scenario
          </h3>
          <p className="text-xs im-text-secondary mt-0.5">
            Test how IncidentMind avoids past failed approaches (Cache scaling) and prioritizes past successes (DB pool fix).
          </p>
        </div>

        {/* Action Steps Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step 1 Button */}
          <button
            onClick={() => onSelectIncident('INC-1042')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
              selectedIncidentId === 'INC-1042'
                ? 'bg-blue-600 im-text-primary border-blue-400 shadow-md shadow-blue-500/30'
                : 'im-bg-surface2 im-text-secondary im-border hover:im-bg-badge hover:border-slate-600'
            }`}
          >
            <span className="h-5 w-5 rounded-full im-bg-badge border im-border flex items-center justify-center text-[10px] font-bold text-blue-600">
              1
            </span>
            <span>INC-1042 (Past Failure)</span>
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          </button>

          <ArrowRight className="h-4 w-4 im-text-faint hidden sm:block" />

          {/* Step 2 Button */}
          <button
            onClick={() => onSelectIncident('INC-1087')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
              selectedIncidentId === 'INC-1087'
                ? 'bg-purple-600 im-text-primary border-purple-400 shadow-md shadow-purple-500/30 ring-2 ring-purple-500/50'
                : 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-purple-200 border-purple-500/40 hover:border-purple-400'
            }`}
          >
            <span className="h-5 w-5 rounded-full bg-purple-800 border border-purple-600 flex items-center justify-center text-[10px] font-bold im-text-primary">
              2
            </span>
            <Play className="h-3.5 w-3.5 text-amber-600 fill-amber-400 animate-pulse" />
            <span>INC-1087 (Recurrence Target)</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/30 text-rose-500 font-bold border border-rose-500/40">
              ACTIVE
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
