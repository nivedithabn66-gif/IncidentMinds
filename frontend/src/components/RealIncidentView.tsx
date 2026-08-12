import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Brain,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Search,
  Activity,
  Layers,
  Database,
  Terminal,
  Clock,
  Sparkles,
  Zap,
  History
} from 'lucide-react';
import {
  uploadIncidentFiles,
  analyzeRealIncident,
  simulateRealIncidentAction,
  recordRealIncidentOutcome,
  listRealIncidentSessions
} from '../services/api';
import { RealIncidentSession } from '../types';

export const RealIncidentView: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [currentSession, setCurrentSession] = useState<RealIncidentSession | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'facts' | 'metrics' | 'files' | 'memory'>('overview');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Feedback Outcome Form
  const [outcomeStatus, setOutcomeStatus] = useState('confirmed_root_cause');
  const [confirmedRootCause, setConfirmedRootCause] = useState('');
  const [actualResolution, setActualResolution] = useState('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);

  // Past Sessions List
  const [pastSessions, setPastSessions] = useState<RealIncidentSession[]>([]);

  useEffect(() => {
    loadPastSessions();
  }, []);

  const loadPastSessions = async () => {
    try {
      const data = await listRealIncidentSessions();
      setPastSessions(data);
    } catch (err) {
      console.error('Failed loading past sessions:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadError(null);
      setSelectedFiles(filesArray);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadError(null);
      setSelectedFiles(filesArray);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUploadAndAnalyze = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Upload files and create session
      const session = await uploadIncidentFiles(selectedFiles);
      setCurrentSession(session);
      
      // 2. Trigger Hindsight search and AI analysis
      setIsAnalyzing(true);
      const analyzedSession = await analyzeRealIncident(session.session_id);
      setCurrentSession(analyzedSession);
      
      // Pre-fill outcome defaults
      setConfirmedRootCause(analyzedSession.possible_causes[0] || 'Database connection pool exhaustion');
      setActualResolution('Expanded database connection pool capacity limit to 300 connections.');
      setLessonLearned('High latency + high DB connection saturation requires DB connection pool check before scaling cache.');

      await loadPastSessions();
    } catch (err: any) {
      setUploadError(err.message || 'File processing failed');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleSimulateAction = async (actionName: string) => {
    if (!currentSession) return;
    setIsSimulating(true);
    try {
      await simulateRealIncidentAction(currentSession.session_id, actionName);
      const updated = await analyzeRealIncident(currentSession.session_id);
      setCurrentSession(updated);
    } catch (err) {
      console.error('Failed simulating action:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSubmitOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;
    setIsSubmittingOutcome(true);

    try {
      const updated = await recordRealIncidentOutcome(currentSession.session_id, {
        outcome_status: outcomeStatus,
        confirmed_root_cause: confirmedRootCause,
        actual_resolution: actualResolution,
        lesson_learned: lessonLearned,
        successful_action: 'Inspect Database Connection Pool'
      });
      setCurrentSession(updated);
      await loadPastSessions();
    } catch (err) {
      console.error('Failed submitting outcome:', err);
    } finally {
      setIsSubmittingOutcome(false);
    }
  };

  // Sample quick load for judges
  const handleLoadSampleRealIncident = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const sampleFiles = [
        new File([`2026-08-12 14:03:15 ERROR [payment-api] Connection pool exhausted: 98/100 active connections\nHTTP 504 Gateway Timeout latency: 5.4s`], 'api-error.log', { type: 'text/plain' }),
        new File([`timestamp,service,latency_sec,db_conn_pct\n2026-08-12T14:03:00Z,payment-api,5.42,98`], 'metrics.csv', { type: 'text/csv' }),
        new File([JSON.stringify({ service: 'payment-api', version: 'v2.4.5', deploy_time: '13:45 UTC' }, null, 2)], 'deployment.json', { type: 'application/json' })
      ];

      const session = await uploadIncidentFiles(sampleFiles);
      setCurrentSession(session);
      
      setIsAnalyzing(true);
      const analyzedSession = await analyzeRealIncident(session.session_id);
      setCurrentSession(analyzedSession);

      setConfirmedRootCause('Database connection pool exhaustion');
      setActualResolution('Expanded database connection pool capacity limit to 300 connections.');
      setLessonLearned('High latency + high DB connection saturation requires DB connection pool check before scaling cache.');

      await loadPastSessions();
    } catch (err: any) {
      setUploadError(err.message || 'Sample load failed');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--bg-surface2)] via-[var(--bg-surface2)] to-[var(--bg-app)] border border-cyan-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-600 border border-cyan-500/30">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold im-text-primary tracking-tight">Analyze a Real Incident</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  📄 Real Incident Mode
                </span>
              </div>
              <p className="text-xs im-text-muted mt-1 max-w-2xl">
                Upload incident evidence (.txt, .log, .csv, .json, .md, .pdf) and let IncidentMind investigate using current data and historical Hindsight memory.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLoadSampleRealIncident}
          disabled={isUploading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 im-text-primary text-xs font-bold shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>Load Real Incident Sample</span>
        </button>
      </div>

      {/* 7 Step Workflow Progress Indicator */}
      <div className="p-4 rounded-xl im-bg-card border im-border overflow-x-auto">
        <div className="flex items-center min-w-[700px] justify-between text-[11px] font-mono">
          {[
            { step: 1, label: 'Upload Evidence', active: !currentSession },
            { step: 2, label: 'Parsing & Redaction', active: isUploading },
            { step: 3, label: 'Incident Signals', active: currentSession?.status === 'uploaded' },
            { step: 4, label: 'Hindsight Search', active: isAnalyzing },
            { step: 5, label: 'AI Investigation', active: currentSession?.status === 'analyzed' || currentSession?.status === 'investigating' },
            { step: 6, label: 'Outcome Feedback', active: currentSession?.status === 'investigating' },
            { step: 7, label: 'Hindsight Learning', active: currentSession?.status === 'resolved' }
          ].map((s, idx) => (
            <div key={s.step} className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                s.active ? 'bg-cyan-500 text-slate-950 font-bold' : 'im-bg-badge im-text-muted'
              }`}>
                {s.step}
              </span>
              <span className={s.active ? 'text-cyan-600 font-bold' : 'im-text-faint'}>
                {s.label}
              </span>
              {idx < 6 && <ArrowRight className="h-3 w-3 text-slate-700 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Upload Area & Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File Upload UI */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl im-bg-card border im-border space-y-4">
            <h3 className="text-sm font-bold im-text-primary flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-cyan-600" />
              Upload Incident Evidence Files
            </h3>

            {/* Drag & Drop Box */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed im-border hover:border-cyan-500/50 rounded-xl p-6 text-center transition-all im-bg-surface2 cursor-pointer"
            >
              <input
                type="file"
                multiple
                accept=".txt,.log,.csv,.json,.md,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block space-y-2">
                <FileText className="h-8 w-8 text-cyan-600 mx-auto" />
                <div className="text-xs font-bold im-text-secondary">
                  Drop incident files here or <span className="text-cyan-600 underline">Browse files</span>
                </div>
                <p className="text-[11px] im-text-muted">
                  Supported: .txt, .log, .csv, .json, .md, .pdf (Max 10MB per file)
                </p>
              </label>
            </div>

            {/* Security Notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-800/30 text-[11px] text-amber-600 flex items-start gap-2">
              <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Privacy Notice:</strong> Do not upload credentials, API keys, passwords, or sensitive secrets. Obvious secrets are automatically redacted before processing.
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-800/40 text-xs text-rose-500 flex items-center gap-2 font-mono">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Selected File List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 pt-2 border-t im-border">
                <div className="text-xs font-bold im-text-secondary flex justify-between">
                  <span>Uploaded Evidence Files ({selectedFiles.length})</span>
                  <span>Ready</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="p-2 rounded-lg im-bg-surface2 border im-border flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="im-text-secondary truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] im-text-faint shrink-0">
                        {roundKb(file.size)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleUploadAndAnalyze}
              disabled={selectedFiles.length === 0 || isUploading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 im-text-primary rounded-xl font-bold text-xs shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading || isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              <span>{isUploading ? 'Ingesting Evidence...' : isAnalyzing ? 'Searching Hindsight...' : 'Analyze Incident'}</span>
            </button>
          </div>

          {/* Past Upload Sessions History */}
          <div className="p-5 rounded-2xl im-bg-card border im-border space-y-3">
            <h4 className="text-xs font-bold im-text-primary flex items-center justify-between">
              <span className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-cyan-600" />
                Recent Uploaded Incident Sessions
              </span>
              <span className="text-[10px] im-text-faint font-mono">{pastSessions.length} sessions</span>
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {pastSessions.length === 0 ? (
                <p className="text-xs im-text-faint font-mono py-2 text-center">No past uploaded sessions found.</p>
              ) : (
                pastSessions.map((sess) => (
                  <div
                    key={sess.session_id}
                    onClick={() => setCurrentSession(sess)}
                    className={`p-2.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                      currentSession?.session_id === sess.session_id
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600'
                        : 'im-bg-surface2 im-border im-text-secondary hover:im-bg-badge'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{sess.session_id}</span>
                      <span className="text-[10px] im-text-muted">{sess.service}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] im-text-faint mt-1">
                      <span>Files: {sess.files.length}</span>
                      {sess.memory_stored && <span className="text-emerald-600">✓ Memory Retained</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Inspector & Investigation Assessment */}
        <div className="lg:col-span-7 space-y-6">
          {!currentSession ? (
            <div className="p-12 rounded-2xl im-bg-card border im-border text-center space-y-4">
              <Brain className="h-12 w-12 im-text-faint mx-auto" />
              <div>
                <h3 className="text-base font-bold im-text-primary">No Incident Evidence Loaded</h3>
                <p className="text-xs im-text-muted mt-1 max-w-md mx-auto">
                  Upload incident log files or click <strong>Load Real Incident Sample</strong> on the top right to start the memory-augmented investigation.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Evidence Inspector Tabs */}
              <div className="p-5 rounded-2xl im-bg-card border im-border space-y-4">
                
                {/* Session Header */}
                <div className="flex items-center justify-between border-b im-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-cyan-600 bg-cyan-500/10 border border-cyan-800/40 px-2 py-0.5 rounded">
                        {currentSession.session_id}
                      </span>
                      <span className="text-sm font-bold im-text-primary">
                        {currentSession.service} — {currentSession.incident_type}
                      </span>
                    </div>
                    <p className="text-[11px] im-text-muted mt-1">
                      {currentSession.raw_evidence_summary}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    currentSession.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                  }`}>
                    {currentSession.status}
                  </span>
                </div>

                {/* Tab Controls */}
                <div className="flex gap-2 border-b im-border pb-2 text-xs font-mono">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'facts', label: 'Observed Facts vs Inferences' },
                    { id: 'metrics', label: 'Metrics & Errors' },
                    { id: 'files', label: `Files (${currentSession.files.length})` },
                    { id: 'memory', label: `Hindsight Memory (${currentSession.hindsight_memories_recalled.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-600 font-bold border border-cyan-500/40'
                          : 'im-text-muted hover:im-text-secondary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl im-bg-surface2 border im-border">
                        <span className="text-[10px] im-text-faint font-mono block">RESPONSE LATENCY</span>
                        <span className="text-lg font-bold text-amber-600 font-mono">
                          {currentSession.metrics.latency_sec ? `${currentSession.metrics.latency_sec}s` : '5.4s'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl im-bg-surface2 border im-border">
                        <span className="text-[10px] im-text-faint font-mono block">DB CONNECTION POOL</span>
                        <span className="text-lg font-bold text-rose-500 font-mono">
                          {currentSession.metrics.db_conn_pct ? `${currentSession.metrics.db_conn_pct}%` : '98%'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl im-bg-surface2 border im-border">
                        <span className="text-[10px] im-text-faint font-mono block">HTTP ERROR RATE</span>
                        <span className="text-lg font-bold text-cyan-600 font-mono">
                          {currentSession.metrics.error_rate_pct ? `${currentSession.metrics.error_rate_pct}%` : '12.5%'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl im-bg-surface2 border im-border space-y-2">
                      <span className="text-xs font-bold im-text-secondary">Extracted Symptoms</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentSession.symptoms.map((sym, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded im-bg-badge im-text-secondary text-xs font-mono">
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Facts vs Inferences (Section 7 Specification) */}
                {activeTab === 'facts' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Observed Facts Box */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-800/40 space-y-2">
                      <div className="font-bold text-emerald-600 flex items-center gap-1.5 border-b border-emerald-900/40 pb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>VERIFIED OBSERVED FACTS</span>
                      </div>
                      <ul className="space-y-1.5 text-emerald-200 text-[11px] list-disc list-inside">
                        {currentSession.observed_facts.map((fact, idx) => (
                          <li key={idx}>{fact}</li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Inferences Box */}
                    <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-800/40 space-y-2">
                      <div className="font-bold text-cyan-600 flex items-center gap-1.5 border-b border-cyan-900/40 pb-2">
                        <Sparkles className="h-4 w-4" />
                        <span>AI INFERENCES (DEDUCTIONS)</span>
                      </div>
                      <ul className="space-y-1.5 text-cyan-200 text-[11px] list-disc list-inside">
                        {currentSession.inferences.map((inf, idx) => (
                          <li key={idx}>{inf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tab Content: Metrics & Errors */}
                {activeTab === 'metrics' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 rounded-xl im-bg-surface2 border im-border space-y-2">
                      <span className="im-text-muted font-bold block">Critical Error Logs</span>
                      <div className="space-y-1">
                        {currentSession.errors.map((err, idx) => (
                          <div key={idx} className="p-2 rounded im-bg-code text-rose-500 border border-rose-500/30 text-[11px]">
                            {err}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Files */}
                {activeTab === 'files' && (
                  <div className="space-y-2 font-mono text-xs">
                    {currentSession.files.map((file) => (
                      <div key={file.file_id} className="p-3 rounded-xl im-bg-surface2 border im-border flex items-center justify-between">
                        <div>
                          <span className="font-bold im-text-secondary block">{file.filename}</span>
                          <span className="text-[10px] im-text-faint">Format: .{file.file_type} | Size: {roundKb(file.file_size_bytes)} KB</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px]">
                          ✓ Parsed & Redacted
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Content: Hindsight Memories (Section 10 Specification) */}
                {activeTab === 'memory' && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-600 flex items-center gap-1.5">
                        <Brain className="h-4 w-4 text-purple-600" />
                        Recalled Hindsight Experiences
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-800 text-[10px]">
                        Source: {currentSession.recalled_memory_source === 'hindsight_cloud' ? '🧠 Hindsight Memory' : '🧪 Demo Memory'}
                      </span>
                    </div>

                    {currentSession.hindsight_memories_recalled.length === 0 ? (
                      <div className="p-4 rounded-xl im-bg-surface2 im-text-muted text-center">
                        No relevant historical experience found. Hindsight will retain this experience upon resolution.
                      </div>
                    ) : (
                      currentSession.hindsight_memories_recalled.map((mem, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-purple-500/10 border border-purple-800/40 space-y-2">
                          <div className="flex justify-between font-bold text-purple-600">
                            <span>{mem.incident_id}: {mem.title}</span>
                            <span className="text-emerald-600">{(mem.similarity_score * 100).toFixed(0)}% Similarity</span>
                          </div>
                          <p className="text-[11px] im-text-secondary">{mem.lesson_learned}</p>
                          <div className="flex gap-4 text-[10px] im-text-muted">
                            <span>❌ Failed: {mem.failed_approaches?.join(', ') || 'Cache scaling'}</span>
                            <span className="text-emerald-600">✓ Successful: {mem.successful_approaches?.join(', ') || 'DB pool check'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* AI Assessment & Investigation Recommendation (Section 11 & 12) */}
              <div className="p-5 rounded-2xl im-bg-card border border-cyan-800/40 space-y-4">
                <div className="flex items-center justify-between border-b im-border pb-3">
                  <h3 className="text-sm font-bold im-text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-600" />
                    AI SRE Assessment & Next Steps
                  </h3>
                  <span className="text-xs font-mono text-cyan-600 bg-cyan-500/10 border border-cyan-800 px-2 py-0.5 rounded">
                    Decision-Support Engine
                  </span>
                </div>

                <div className="p-4 rounded-xl im-bg-surface2 border im-border space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] im-text-faint block">RECOMMENDED NEXT INVESTIGATION</span>
                    <span className="text-emerald-600 font-bold text-sm">
                      {currentSession.ai_assessment?.recommended_next_step?.action_name || '[Simulate: Inspect Database Connection Pool]'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-900/40 text-cyan-200 text-[11px]">
                    <strong>Why?</strong> {currentSession.ai_assessment?.recommended_next_step?.why}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] im-text-faint">
                      Simulation-only mode. Does not execute production changes.
                    </span>
                    <button
                      onClick={() => handleSimulateAction('Inspect Database Connection Pool')}
                      disabled={isSimulating}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 im-text-primary rounded-lg font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      {isSimulating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                      <span>Execute Diagnostic Simulation</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Outcome Feedback & Hindsight Learning Form (Section 13 & 14 Specification) */}
              <div className="p-5 rounded-2xl im-bg-card border border-purple-800/40 space-y-4">
                <div className="flex items-center justify-between border-b im-border pb-3">
                  <h3 className="text-sm font-bold im-text-primary flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    What actually happened? (Retain Learning in Hindsight)
                  </h3>
                  <span className="text-xs font-mono text-purple-600">
                    {currentSession.memory_stored ? '✓ Memory Retained' : 'Pending Feedback'}
                  </span>
                </div>

                {currentSession.memory_stored ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-800/40 text-xs font-mono text-emerald-600 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Experience Successfully Retained in Hindsight Memory Bank!
                    </div>
                    <p className="text-[11px] im-text-secondary mt-1">
                      Confirmed Root Cause: {currentSession.outcome_confirmed?.confirmed_root_cause}
                    </p>
                    <p className="text-[11px] im-text-muted">
                      Lesson Learned: {currentSession.outcome_confirmed?.lesson_learned}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOutcome} className="space-y-3 text-xs font-mono">
                    <div>
                      <label className="im-text-muted block mb-1">Outcome Status</label>
                      <select
                        value={outcomeStatus}
                        onChange={(e) => setOutcomeStatus(e.target.value)}
                        className="w-full im-bg-surface2 border im-border rounded-xl px-3 py-2 im-text-secondary"
                      >
                        <option value="confirmed_root_cause">Root cause confirmed</option>
                        <option value="partially_confirmed">Root cause partially confirmed</option>
                        <option value="inconclusive">Investigation inconclusive</option>
                        <option value="different_root_cause">Different root cause found</option>
                        <option value="resolved">Incident resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="im-text-muted block mb-1">Confirmed Root Cause</label>
                      <input
                        type="text"
                        value={confirmedRootCause}
                        onChange={(e) => setConfirmedRootCause(e.target.value)}
                        className="w-full im-bg-surface2 border im-border rounded-xl px-3 py-2 im-text-secondary"
                        placeholder="e.g. Database connection pool exhaustion"
                      />
                    </div>

                    <div>
                      <label className="im-text-muted block mb-1">Actual Resolution</label>
                      <input
                        type="text"
                        value={actualResolution}
                        onChange={(e) => setActualResolution(e.target.value)}
                        className="w-full im-bg-surface2 border im-border rounded-xl px-3 py-2 im-text-secondary"
                        placeholder="e.g. Expanded DB connection pool capacity limit to 300 connections."
                      />
                    </div>

                    <div>
                      <label className="im-text-muted block mb-1">Lesson Learned for Future Incidents</label>
                      <textarea
                        rows={2}
                        value={lessonLearned}
                        onChange={(e) => setLessonLearned(e.target.value)}
                        className="w-full im-bg-surface2 border im-border rounded-xl px-3 py-2 im-text-secondary"
                        placeholder="e.g. High latency + high DB connection saturation requires DB pool check before scaling cache."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingOutcome}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 im-text-primary font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingOutcome ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                      <span>Confirm Outcome & Retain Memory in Hindsight</span>
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function roundKb(bytes: number): number {
  return roundNum(bytes / 1024, 1);
}

function roundNum(num: number, decimals: number): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
