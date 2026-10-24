import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, AlertCircle, Trash2, Folder, Tag as TagIcon, CheckSquare } from 'lucide-react';
import { TaskPriority } from '../../types';
import { formatDuration } from '../../domain/time-tracking';

export const TaskDetailPanel: React.FC = () => {
  const {
    state,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    scheduleTask,
    addSubtask,
  } = useApp();

  const task = selectedTaskId ? state.tasks[selectedTaskId] : null;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [timeEstimateMin, setTimeEstimateMin] = useState<number>(0);
  const [dueDay, setDueDay] = useState<string>('');
  const [dueTimeStr, setDueTimeStr] = useState<string>('');
  const [newSubtask, setNewSubtask] = useState<string>('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || '');
      setPriority(task.priority ?? null);
      setTimeEstimateMin(Math.round(task.timeEstimate / (60 * 1000)));
      setDueDay(task.dueDay || '');
      if (task.dueWithTime) {
        const d = new Date(task.dueWithTime);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        setDueTimeStr(`${hours}:${mins}`);
        setDueDay(d.toISOString().split('T')[0]);
      } else {
        setDueTimeStr('');
      }
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    let dueWithTime: number | null = null;
    let finalDueDay: string | null = null;

    if (dueTimeStr && dueDay) {
      const [h, m] = dueTimeStr.split(':').map((v) => parseInt(v, 10));
      const [year, month, day] = dueDay.split('-').map((v) => parseInt(v, 10));
      dueWithTime = new Date(year, month - 1, day, h, m).getTime();
      finalDueDay = null; // ADR #1 mutual exclusivity
    } else if (dueDay) {
      finalDueDay = dueDay;
      dueWithTime = null; // ADR #1 mutual exclusivity
    }

    updateTask({
      ...task,
      title: title.trim(),
      notes,
      priority,
      timeEstimate: timeEstimateMin * 60 * 1000,
      dueDay: finalDueDay,
      dueWithTime,
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 440,
        height: '100vh',
        backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          Task Details
        </span>
        <button onClick={() => setSelectedTaskId(null)} className="btn-icon">
          <X size={18} />
        </button>
      </div>

      {/* Drawer Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          style={{
            width: '100%',
            fontSize: 16,
            fontWeight: 600,
            padding: '8px 0',
            border: 'none',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'transparent',
            color: 'var(--text-main)',
            outline: 'none',
            marginBottom: 20,
          }}
        />

        {/* Priority & Project row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)' }}>Priority</label>
            <select
              value={priority || ''}
              onChange={(e) => {
                const val = e.target.value ? (parseInt(e.target.value, 10) as TaskPriority) : null;
                setPriority(val);
                updateTask({ ...task, priority: val });
              }}
              style={{
                width: '100%',
                marginTop: 4,
                padding: '6px 8px',
                fontSize: 12,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-main)',
              }}
            >
              <option value="">No Priority</option>
              <option value="1">Low Priority</option>
              <option value="2">Medium Priority</option>
              <option value="3">High Priority</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)' }}>Estimate (Mins)</label>
            <input
              type="number"
              min="0"
              step="5"
              value={timeEstimateMin || ''}
              onChange={(e) => setTimeEstimateMin(parseInt(e.target.value, 10) || 0)}
              onBlur={handleSave}
              placeholder="e.g. 25"
              style={{
                width: '100%',
                marginTop: 4,
                padding: '6px 8px',
                fontSize: 12,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        {/* Scheduling (ADR #1 Mutual Exclusivity) */}
        <div style={{ marginBottom: 20, padding: 12, backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
            Scheduling (Date or Time)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Scheduled Date</label>
              <input
                type="date"
                value={dueDay}
                onChange={(e) => {
                  setDueDay(e.target.value);
                  handleSave();
                }}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '6px 8px',
                  fontSize: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Specific Time (Optional)</label>
              <input
                type="time"
                value={dueTimeStr}
                onChange={(e) => {
                  setDueTimeStr(e.target.value);
                  handleSave();
                }}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '6px 8px',
                  fontSize: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>
            * Setting a specific time clears all-day scheduling per ADR #1.
          </div>
        </div>

        {/* Subtasks Checklist */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', display: 'block', marginBottom: 6 }}>
            Checklist / Subtasks
          </label>
          <form onSubmit={handleAddSubtask} style={{ marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Add checklist item..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 12,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-main)',
              }}
            />
          </form>
          {task.subTaskIds.map((stId) => {
            const st = state.tasks[stId];
            if (!st) return null;
            return (
              <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={st.isDone}
                  onChange={() => updateTask({ ...st, isDone: !st.isDone })}
                />
                <span style={{ textDecoration: st.isDone ? 'line-through' : 'none', color: st.isDone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  {st.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Notes & Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', display: 'block', marginBottom: 6 }}>
            Notes & Scratchpad
          </label>
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add task notes, links, or specifications..."
            style={{
              width: '100%',
              padding: 10,
              fontSize: 13,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-main)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Time stats */}
        <div style={{ padding: 12, backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Time Tracked</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
            {formatDuration(task.timeSpent, true)}
          </div>
          {Object.keys(task.timeSpentOnDay).length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
              {Object.entries(task.timeSpentOnDay).map(([day, ms]) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>{day}</span>
                  <span style={{ fontWeight: 600 }}>{formatDuration(ms)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete task button */}
        <button
          onClick={() => deleteTask(task.id)}
          className="btn"
          style={{ width: '100%', color: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}
        >
          <Trash2 size={14} />
          <span>Delete Task</span>
        </button>
      </div>
    </div>
  );
};
