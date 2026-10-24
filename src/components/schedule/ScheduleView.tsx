import React from 'react';
import { useApp } from '../../context/AppContext';
import { computeDailyScheduleBlocks, getHoursGrid, formatTimeSlot } from '../../domain/schedule';
import { getTodayDateString } from '../../domain/tasks';
import { formatDuration } from '../../domain/time-tracking';
import { Clock, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { state, setSelectedTaskId, addTask } = useApp();
  const todayStr = getTodayDateString();

  const tasksList = Object.values(state.tasks);
  const blocks = computeDailyScheduleBlocks(tasksList, todayStr);
  const hours = getHoursGrid();

  const handleSlotClick = (hour: number) => {
    const today = new Date();
    today.setHours(hour, 0, 0, 0);
    const title = prompt(`Schedule a task at ${formatTimeSlot(hour)}:`);
    if (title && title.trim()) {
      addTask({
        title: title.trim(),
        dueWithTime: today.getTime(), // ADR #1: Scheduled with specific time
        timeEstimate: 45 * 60 * 1000,
      });
    }
  };

  return (
    <div className="scroll-area">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Visual Schedule Timeline
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Daily 24-hour timeboxing grid with conflict detection. Click any slot to schedule a task.
        </p>
      </div>

      {/* Conflicts Banner */}
      {blocks.some((b) => b.hasConflict) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          <AlertTriangle size={18} />
          <span>Schedule conflict detected: You have overlapping tasks in your daily plan.</span>
        </div>
      )}

      {/* 24-Hour Timeline Grid */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {hours.map((hour) => {
          // Find blocks starting in this hour slot
          const slotBlocks = blocks.filter((b) => {
            const blockDate = new Date(b.startMs);
            return blockDate.getHours() === hour;
          });

          return (
            <div
              key={hour}
              onClick={() => handleSlotClick(hour)}
              style={{
                display: 'flex',
                minHeight: 52,
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background-color 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {/* Hour Label */}
              <div
                style={{
                  width: 80,
                  padding: '10px 14px',
                  borderRight: '1px solid var(--border-subtle)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-subtle)',
                  fontFamily: 'monospace',
                }}
              >
                {formatTimeSlot(hour)}
              </div>

              {/* Slot Area with blocks */}
              <div style={{ flex: 1, padding: '6px 12px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {slotBlocks.map((b) => {
                  const startTimeStr = new Date(b.startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTimeStr = new Date(b.endMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div
                      key={b.taskId}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(b.taskId);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: b.hasConflict ? 'var(--danger-light)' : 'var(--primary-light)',
                        border: `1px solid ${b.hasConflict ? 'var(--danger)' : 'var(--primary-border)'}`,
                        color: b.hasConflict ? 'var(--danger)' : 'var(--primary)',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Clock size={13} />
                      <span>{b.title}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>
                        ({startTimeStr} - {endTimeStr})
                      </span>
                      {b.hasConflict && (
                        <span title="Overlapping time slot conflict!">
                          <AlertTriangle size={13} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
