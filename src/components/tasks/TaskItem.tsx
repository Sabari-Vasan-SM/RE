import React, { useState } from 'react';
import { Task, TaskPriority } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { formatDuration } from '../../domain/time-tracking';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const {
    state,
    toggleTaskDone,
    toggleActiveTaskTimer,
    setSelectedTaskId,
    deleteTask,
    addSubtask,
    scheduleTask,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const isCurrentActive = state.currentTaskId === task.id;
  const project = task.projectId ? state.projects[task.projectId] : null;
  const subtasks = task.subTaskIds.map((id) => state.tasks[id]).filter(Boolean);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    setIsExpanded(true);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${isCurrentActive ? 'var(--primary-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: 8,
        transition: 'all 0.15s ease',
        boxShadow: isCurrentActive ? '0 0 0 1px var(--primary-border)' : 'var(--shadow-sm)',
      }}
    >
      {/* Main Task Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
          gap: 12,
        }}
      >
        {/* Subtask expand chevron */}
        {subtasks.length > 0 ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center' }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div style={{ width: 16 }} />
        )}

        {/* Complete Checkbox */}
        <button
          onClick={() => toggleTaskDone(task.id)}
          style={{
            color: task.isDone ? 'var(--success)' : 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {task.isDone ? <CheckCircle2 size={19} /> : <Circle size={19} />}
        </button>

        {/* Timer Play/Pause Button */}
        <button
          onClick={() => toggleActiveTaskTimer(task.id)}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: isCurrentActive ? 'var(--primary)' : 'var(--bg-subtle)',
            color: isCurrentActive ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          title={isCurrentActive ? 'Pause time tracking' : 'Start tracking time'}
        >
          {isCurrentActive ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 2 }} />}
        </button>

        {/* Title and metadata */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => setSelectedTaskId(task.id)}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: task.isDone ? 'var(--text-muted)' : 'var(--text-main)',
              textDecoration: task.isDone ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11 }}>
            {project && (
              <span
                style={{
                  color: project.color,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: project.color }} />
                {project.title}
              </span>
            )}
            {task.dueDay && (
              <span style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Calendar size={11} />
                {task.dueDay}
              </span>
            )}
            {task.dueWithTime && (
              <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={11} />
                {new Date(task.dueWithTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {subtasks.length > 0 && (
              <span style={{ color: 'var(--text-subtle)' }}>
                {subtasks.filter((s) => s.isDone).length}/{subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        {task.priority && (
          <span
            className={`badge-priority-${task.priority}`}
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
            }}
          >
            {task.priority === 3 ? 'High' : task.priority === 2 ? 'Med' : 'Low'}
          </span>
        )}

        {/* Time spent / estimate */}
        <div style={{ textAlign: 'right', minWidth: 70 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: isCurrentActive ? 'var(--primary)' : 'var(--text-main)' }}>
            {formatDuration(task.timeSpent)}
          </div>
          {task.timeEstimate > 0 && (
            <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
              est. {formatDuration(task.timeEstimate)}
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={() => deleteTask(task.id)}
          className="btn-icon"
          title="Delete Task"
          style={{ padding: 6 }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Subtasks Expanded Section */}
      {isExpanded && (
        <div
          style={{
            padding: '4px 14px 10px 42px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          {subtasks.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 0',
                fontSize: 13,
              }}
            >
              <button
                onClick={() => toggleTaskDone(st.id)}
                style={{ color: st.isDone ? 'var(--success)' : 'var(--text-subtle)' }}
              >
                {st.isDone ? <CheckCircle2 size={15} /> : <Circle size={15} />}
              </button>
              <span
                style={{
                  flex: 1,
                  textDecoration: st.isDone ? 'line-through' : 'none',
                  color: st.isDone ? 'var(--text-muted)' : 'var(--text-main)',
                }}
              >
                {st.title}
              </span>
              <button
                onClick={() => deleteTask(st.id)}
                style={{ color: 'var(--text-subtle)', padding: 2 }}
                title="Delete subtask"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {isAddingSubtask ? (
            <form onSubmit={handleAddSubtask} style={{ marginTop: 6 }}>
              <input
                type="text"
                autoFocus
                placeholder="Subtask title..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--primary-border)',
                  backgroundColor: 'var(--bg-card)',
                  outline: 'none',
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAddingSubtask(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'var(--primary)',
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              <Plus size={13} />
              <span>Add Subtask</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
