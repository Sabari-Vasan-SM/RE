import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, Flame, Sun, Moon, Plus, Clock } from 'lucide-react';
import { formatDuration } from '../../domain/time-tracking';

export const Header: React.FC = () => {
  const {
    state,
    focusSession,
    toggleActiveTaskTimer,
    setIsFocusOverlayOpen,
    toggleTheme,
    setSelectedTaskId,
  } = useApp();

  const activeTask = state.currentTaskId ? state.tasks[state.currentTaskId] : null;

  // Format focus session time
  const focusRemainingMs = Math.max(0, focusSession.durationMs - focusSession.elapsedMs);
  const focusTimeDisplay = formatDuration(
    focusSession.mode === 'FLOWTIME' ? focusSession.elapsedMs : focusRemainingMs,
    true
  );

  return (
    <header
      style={{
        height: 60,
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        userSelect: 'none',
      }}
    >
      {/* Left: Active Task Tracker Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {activeTask ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {/* Pulsing indicator */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 8px var(--success)',
              }}
            />
            <button
              onClick={() => toggleActiveTaskTimer(activeTask.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--primary)',
              }}
              title="Pause tracking"
            >
              <Pause size={14} />
            </button>
            <span
              onClick={() => setSelectedTaskId(activeTask.id)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-main)',
                maxWidth: 220,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
              title="Click to view task details"
            >
              {activeTask.title}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--primary)',
                marginLeft: 4,
              }}
            >
              {formatDuration(activeTask.timeSpent, true)}
            </span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-subtle)',
            }}
          >
            <Clock size={15} />
            <span>No task active — click play on a task to track</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Focus Mode Launcher */}
        <button
          onClick={() => setIsFocusOverlayOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: focusSession.isRunning ? 'var(--warning-light)' : 'var(--bg-card)',
            border: `1px solid ${focusSession.isRunning ? 'var(--warning)' : 'var(--border-subtle)'}`,
            color: focusSession.isRunning ? 'var(--warning)' : 'var(--text-main)',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          <Flame size={16} />
          <span>
            {focusSession.isRunning
              ? `${focusSession.phase === 'WORK' ? 'Focus' : 'Break'}: ${focusTimeDisplay}`
              : 'Focus Mode'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${state.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {state.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
