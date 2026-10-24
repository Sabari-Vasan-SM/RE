import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, Flame } from 'lucide-react';
import { formatDuration } from '../../domain/time-tracking';

export const FocusOverlay: React.FC = () => {
  const {
    state,
    isFocusOverlayOpen,
    setIsFocusOverlayOpen,
    focusSession,
    startFocus,
    pauseFocus,
    skipFocusBreak,
    resetFocus,
    setFocusMode,
  } = useApp();

  if (!isFocusOverlayOpen) return null;

  const activeTask = focusSession.activeTaskId ? state.tasks[focusSession.activeTaskId] : null;

  // Calculate progress circle stroke
  const isCountdown = focusSession.mode !== 'FLOWTIME';
  const remainingMs = Math.max(0, focusSession.durationMs - focusSession.elapsedMs);
  const displayMs = isCountdown ? remainingMs : focusSession.elapsedMs;

  const progressRatio =
    focusSession.durationMs > 0
      ? Math.min(1, focusSession.elapsedMs / focusSession.durationMs)
      : 0;

  const circleRadius = 130;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const phaseTitle =
    focusSession.phase === 'WORK'
      ? 'Focus Session'
      : focusSession.phase === 'SHORT_BREAK'
      ? 'Short Rest Break'
      : focusSession.phase === 'LONG_BREAK'
      ? 'Long Recovery Break'
      : 'Ready to Focus';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 13, 22, 0.95)',
        backdropFilter: 'blur(8px)',
        zIndex: 500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f8fafc',
      }}
    >
      {/* Top Header controls */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          right: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Flame size={22} style={{ color: 'var(--warning)' }} />
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            FocusFlow Immersive Mode
          </span>
        </div>

        {/* Mode Switcher Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            padding: 3,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {(['POMODORO', 'FLOWTIME', 'COUNTDOWN'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFocusMode(m)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: focusSession.mode === m ? 'var(--primary)' : 'transparent',
                color: '#ffffff',
                textTransform: 'capitalize',
              }}
            >
              {m.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsFocusOverlayOpen(false)}
          className="btn-icon"
          style={{ color: '#ffffff' }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Focus Center */}
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        {/* Phase Badge */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor:
              focusSession.phase === 'WORK'
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(16, 185, 129, 0.2)',
            color: focusSession.phase === 'WORK' ? '#60a5fa' : '#34d399',
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 24,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {phaseTitle}
        </div>

        {/* Circular SVG Timer */}
        <div style={{ position: 'relative', width: 300, height: 300, margin: '0 auto 28px auto' }}>
          <svg width="300" height="300" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r={circleRadius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
              fill="none"
            />
            {/* Active progress ring */}
            <circle
              cx="150"
              cy="150"
              r={circleRadius}
              stroke={focusSession.phase === 'WORK' ? 'var(--primary)' : 'var(--success)'}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Time digits in center */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: 'monospace',
                letterSpacing: '-0.02em',
              }}
            >
              {formatDuration(displayMs, true)}
            </div>
            {focusSession.mode === 'POMODORO' && (
              <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginTop: 4 }}>
                Pomodoro #{focusSession.completedPomodoros + 1}
              </div>
            )}
          </div>
        </div>

        {/* Task Title */}
        {activeTask && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Tracking Task</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>{activeTask.title}</div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button
            onClick={resetFocus}
            className="btn-icon"
            style={{ padding: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
            title="Reset Session"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={() => (focusSession.isRunning ? pauseFocus() : startFocus())}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            }}
          >
            {focusSession.isRunning ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
          </button>

          {(focusSession.phase === 'SHORT_BREAK' || focusSession.phase === 'LONG_BREAK') && (
            <button
              onClick={skipFocusBreak}
              className="btn-icon"
              style={{ padding: 12, backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}
              title="Skip Break and Return to Work"
            >
              <SkipForward size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
