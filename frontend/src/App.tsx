import React, { useEffect, useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { OverviewDashboard } from './components/OverviewDashboard';
import { IncidentDetailView } from './components/IncidentDetailView';
import { RealIncidentView } from './components/RealIncidentView';
import { MemoryExplorerView } from './components/MemoryExplorerView';
import { LearningDashboardView } from './components/LearningDashboardView';
import { IncidentSimulatorView } from './components/IncidentSimulatorView';
import { DemoModeView } from './components/DemoModeView';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { AboutView } from './components/AboutView';
import { Incident, MemoryStatus, InvestigationResult } from './types';
import {
  fetchIncidents,
  fetchMemoryStatus,
  triggerInvestigation,
  executeSimulatedAction,
  resolveIncidentApi,
  resetDemoData,
  searchMemoryApi
} from './services/api';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-1087');
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);
  const [investigationResults, setInvestigationResults] = useState<Record<string, InvestigationResult>>({});
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(true);

  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'memory' = 'info'
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incList, memStatus] = await Promise.all([
        fetchIncidents(),
        fetchMemoryStatus()
      ]);
      setIncidents(incList);
      setMemoryStatus(memStatus);

      // Auto-trigger investigation on primary demo target INC-1087 if selected
      const inc1087 = incList.find((i) => i.incident_id === 'INC-1087');
      if (inc1087 && !investigationResults['INC-1087']) {
        runInvestigation('INC-1087', memoryEnabled);
      }
    } catch (err: any) {
      console.error('Failed loading application data:', err);
      setError('Could not connect to IncidentMind backend API. Please make sure Python uvicorn server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      setInvestigationResults({});
      await loadData();
      setSelectedIncidentId('INC-1087');
      addToast('Demo State Reset', 'Incidents and memory baseline restored to clean demo state.', 'info');
    } catch (err) {
      console.error('Failed resetting demo:', err);
      addToast('Reset Error', 'Failed resetting demo dataset.', 'warning');
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleMemory = () => {
    const nextState = !memoryEnabled;
    setMemoryEnabled(nextState);
    if (nextState) {
      addToast('Memory Enabled', 'Hindsight historical experiences available for AI investigation.', 'memory');
    } else {
      addToast('Memory Disabled', 'AI Agent running without historical memory context.', 'warning');
    }

    if (selectedIncidentId) {
      runInvestigation(selectedIncidentId, nextState);
    }
  };

  const runInvestigation = async (incidentId: string, withMemory: boolean = memoryEnabled) => {
    setIsInvestigating(true);
    try {
      const res = await triggerInvestigation(incidentId, withMemory);
      setInvestigationResults((prev) => ({ ...prev, [incidentId]: res }));

      if (withMemory && res.recalled_memories?.historical_matches?.length) {
        addToast(
          'Historical Experience Recalled',
          `Matched ${res.recalled_memories.historical_matches[0].incident_id} (${Math.round(res.recalled_memories.historical_matches[0].similarity_score * 100)}% similarity).`,
          'memory'
        );
      }

      // Refresh incidents list
      const updatedList = await fetchIncidents();
      setIncidents(updatedList);
    } catch (err) {
      console.error(`Investigation error on ${incidentId}:`, err);
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleExecuteAction = async (actionId: string, actionName: string) => {
    if (!selectedIncidentId) return;
    try {
      const result = await executeSimulatedAction(selectedIncidentId, actionId, actionName);

      if (result.status === 'FAILED') {
        addToast('Troubleshooting Action Failed', result.result_message, 'warning');
      } else {
        addToast('Action Executed', result.result_message, 'success');
      }

      // Refresh incident details & re-run investigation with updated action history
      const updatedList = await fetchIncidents();
      setIncidents(updatedList);
      await runInvestigation(selectedIncidentId, memoryEnabled);
    } catch (err) {
      console.error('Action execution failed:', err);
    }
  };

  const handleResolveIncident = async (rootCause: string, resolution: string, lessonLearned: string) => {
    if (!selectedIncidentId) return;
    try {
      await resolveIncidentApi(selectedIncidentId, rootCause, resolution, lessonLearned);

      // Refresh incidents and memory status
      const [updatedList, memStatus] = await Promise.all([
        fetchIncidents(),
        fetchMemoryStatus()
      ]);
      setIncidents(updatedList);
      setMemoryStatus(memStatus);
      addToast('New Experience Stored', `Retained postmortem lesson for ${selectedIncidentId} in Hindsight.`, 'memory');
    } catch (err) {
      console.error('Resolution failed:', err);
    }
  };

  const handleIncidentCreated = (newInc: Incident) => {
    setIncidents((prev) => [newInc, ...prev]);
    setSelectedIncidentId(newInc.incident_id);
    addToast('New Incident Injected', `${newInc.incident_id} created in simulator.`, 'info');
    runInvestigation(newInc.incident_id, memoryEnabled);
  };

  const activeIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;
  const currentIncident = incidents.find((i) => i.incident_id === selectedIncidentId) || incidents[0] || null;

  // useTheme is consumed here only to ensure the context initialises;
  // the actual class toggle is handled inside ThemeContext (on <html>).
  useTheme();

  return (
    <div className="min-h-screen im-bg-app im-text-primary flex font-sans overflow-hidden" style={{ transition: 'background-color 0.25s, color 0.25s' }}>
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeIncidentsCount={activeIncidentsCount}
        memoryStatus={memoryStatus}
      />

      {/* RIGHT SIDE MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* 2. TOP BAR */}
        <Navbar
          memoryStatus={memoryStatus}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          memoryEnabled={memoryEnabled}
          onToggleMemory={handleToggleMemory}
        />

        {/* 3. MAIN CONTENT ROUTER */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-center justify-between text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded im-text-primary font-semibold"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'overview' && (
            <OverviewDashboard
              incidents={incidents}
              memoryStatus={memoryStatus}
              onSelectIncident={(id) => {
                setSelectedIncidentId(id);
                runInvestigation(id, memoryEnabled);
              }}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* Tab 2: Incident Operations & Investigation Workspace */}
          {activeTab === 'incidents' && (
            <div>
              {currentIncident ? (
                <IncidentDetailView
                  incident={currentIncident}
                  investigation={investigationResults[currentIncident.incident_id] || null}
                  onRunInvestigation={(id) => runInvestigation(id, memoryEnabled)}
                  onExecuteAction={handleExecuteAction}
                  onResolveIncident={handleResolveIncident}
                  onBackToDashboard={() => setActiveTab('overview')}
                  isInvestigating={isInvestigating}
                  onAddToast={addToast}
                />
              ) : (
                <div className="p-12 rounded-2xl im-bg-surface border im-border text-center">
                  <ShieldAlert className="h-10 w-10 im-text-faint mx-auto mb-3" />
                  <h3 className="text-base font-bold im-text-primary">All Systems Operational</h3>
                  <p className="text-xs im-text-muted mt-1">No active incidents require investigation.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Real Incident Mode (File Upload & Analysis) */}
          {activeTab === 'real_incident' && (
            <RealIncidentView />
          )}

          {/* Tab 4: Memory Explorer */}
          {activeTab === 'memory' && (
            <MemoryExplorerView onSearchMemory={searchMemoryApi} />
          )}

          {/* Tab 5: What IncidentMind Has Learned */}
          {activeTab === 'learning' && (
            <LearningDashboardView
              summary={null}
              onSearchMemory={searchMemoryApi}
            />
          )}

          {/* Tab 6: Incident Simulator */}
          {activeTab === 'simulator' && (
            <IncidentSimulatorView
              onIncidentCreated={handleIncidentCreated}
              onNavigateToIncident={(id) => {
                setSelectedIncidentId(id);
                setActiveTab('incidents');
              }}
            />
          )}

          {/* Tab 7: Hackathon Demo Suite */}
          {activeTab === 'demo' && (
            <DemoModeView
              incidents={incidents}
              onSelectIncident={(id) => {
                setSelectedIncidentId(id);
                runInvestigation(id, memoryEnabled);
              }}
              onNavigateTab={setActiveTab}
              onRefreshIncidents={loadData}
            />
          )}

          {/* Tab 8: About / Product Details */}
          {activeTab === 'about' && <AboutView />}
        </main>

        <footer className="border-t im-border-subtle im-bg-surface py-3 px-6 text-center text-xs im-text-faint font-mono" style={{ borderStyle: 'solid', transition: 'background-color 0.25s' }}>
          IncidentMind — AI SRE Agent with Long-Term Memory Powered by <strong className="im-text-secondary">Hindsight by Vectorize</strong>
        </footer>
      </div>

      {/* Subtle Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
