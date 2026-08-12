import React from 'react';
import { MemoryStatus } from '../types';
import { RefreshCw, RotateCcw, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  memoryStatus: MemoryStatus | null;
  onResetDemo: () => void;
  isResetting: boolean;
  memoryEnabled: boolean;
  onToggleMemory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  memoryStatus,
  onResetDemo,
  isResetting,
  memoryEnabled,
  onToggleMemory
}) => {
  const { theme, toggleTheme } = useTheme();

  const getMemoryBadge = () => {
    if (!memoryStatus) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Memory Unavailable</span>
        </div>
      );
    }
    if (memoryStatus.hindsight_configured) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hindsight Connected</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span>Development Memory Engine</span>
      </div>
    );
  };

  return (
    <header
      className="h-16 im-navbar border-b im-border-subtle px-6 flex items-center justify-between sticky top-0 z-30"
      style={{ transition: 'background-color 0.25s, border-color 0.25s' }}
    >
      {/* Left: system title + status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="im-text-muted">System:</span>
          <span className="im-text-primary font-semibold">IncidentMind Operational Platform</span>
        </div>

        <div className="hidden md:flex items-center gap-3 font-mono text-[11px]">
          {getMemoryBadge()}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Agent Online</span>
          </div>
          <div className="im-badge px-2.5 py-1 rounded-full border im-border text-xs">
            Env: <strong className="im-text-primary">DEMO</strong>
          </div>
        </div>
      </div>

      {/* Right: theme toggle + memory toggle + reset */}
      <div className="flex items-center gap-3">

        {/* ── Dark / Light Toggle ── */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl im-btn text-xs font-mono font-medium select-none"
        >
          {/* Track */}
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-amber-400'
            }`}
          >
            {/* Thumb */}
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>

          {/* Icon + label */}
          {theme === 'dark' ? (
            <span className="flex items-center gap-1 text-indigo-600">
              <Moon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600">
              <Sun className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Light</span>
            </span>
          )}
        </button>

        {/* ── Memory Toggle ── */}
        <div className="flex items-center gap-3 im-bg-surface2 im-border border rounded-xl p-1.5 px-3" style={{ borderStyle: 'solid' }}>
          <div className="flex flex-col text-right">
            <span className="text-[11px] font-bold im-text-primary flex items-center justify-end gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              Memory {memoryEnabled ? 'ON' : 'OFF'}
            </span>
            <span className="text-[9px] font-mono im-text-muted">
              {memoryEnabled ? 'Historical experience active' : 'Running without memory'}
            </span>
          </div>
          <button
            onClick={onToggleMemory}
            aria-label="Toggle Memory"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              memoryEnabled ? 'bg-purple-600' : 'bg-slate-400'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                memoryEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ── Reset Demo ── */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-2 px-3.5 py-1.5 im-btn rounded-xl text-xs font-medium"
        >
          {isResetting
            ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
            : <RotateCcw className="h-3.5 w-3.5 im-text-muted" />}
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
