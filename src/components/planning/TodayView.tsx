import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskList } from '../tasks/TaskList';
import { isTodayTask, getTodayDateString } from '../../domain/tasks';
import { Plus, CheckCheck, Sparkles, Smile, Star, Calendar } from 'lucide-react';
import { TaskPriority } from '../../types';

export const TodayView: React.FC = () => {
  const { state, addTask, saveDailyNote } = useApp();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const [estimateMins, setEstimateMins] = useState<number>(25);
  const [isFinishingDay, setIsFinishingDay] = useState(false);
  const [reflection, setReflection] = useState('');
  const [mood, setMood] = useState<number>(5);

  const todayStr = getTodayDateString();
  const allTasks = Object.values(state.tasks);
  const todayTasks = allTasks.filter((t) => isTodayTask(t, todayStr));
  const completedToday = todayTasks.filter((t) => t.isDone).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      priority,
      timeEstimate: estimateMins * 60 * 1000,
      dueDay: todayStr, // ADR #1: Scheduled for today
    });
    setTitle('');
  };

  const handleFinishDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyNote({
      date: todayStr,
      content: reflection,
      moodRating: mood,
    });
    setIsFinishingDay(false);
    alert('Great work today! Your daily retrospective has been saved.');
  };

  return (
    <div className="scroll-area">
      {/* Today Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Today's Focus
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Finish Day Retrospective Button */}
        <button
          onClick={() => setIsFinishingDay(true)}
          className="btn btn-secondary"
          style={{ gap: 6 }}
        >
          <CheckCheck size={16} />
          <span>Finish Day & Review</span>
        </button>
      </div>

      {/* Daily Progress Bar */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>Daily Progress</span>
          <span style={{ color: 'var(--text-muted)' }}>
            {completedToday} of {todayTasks.length} tasks completed ({progressPercent}%)
          </span>
        </div>
        <div
          style={{
            height: 8,
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Inline Quick Add Task Box */}
      <form
        onSubmit={handleAddTask}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'var(--bg-card)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <input
          type="text"
          placeholder="Add a task for Today (press Enter)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            outline: 'none',
            fontSize: 14,
            color: 'var(--text-main)',
          }}
        />

        {/* Priority quick select */}
        <select
          value={priority || ''}
          onChange={(e) => setPriority(e.target.value ? (parseInt(e.target.value, 10) as TaskPriority) : null)}
          style={{
            fontSize: 12,
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-main)',
          }}
        >
          <option value="">Priority</option>
          <option value="1">Low</option>
          <option value="2">Medium</option>
          <option value="3">High</option>
        </select>

        <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px' }}>
          <Plus size={15} />
          <span>Add</span>
        </button>
      </form>

      {/* Task List */}
      <TaskList tasks={todayTasks} emptyMessage="No tasks scheduled for Today yet. Add your priorities above!" />

      {/* Finish Day Modal */}
      {isFinishingDay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            style={{
              width: 480,
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Day Finish Retrospective</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Review your accomplishments and record thoughts before wrapping up.
            </p>

            <form onSubmit={handleFinishDaySubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  How would you rate today's focus? (1 to 5)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setMood(star)}
                      style={{
                        padding: 8,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: mood >= star ? 'var(--warning-light)' : 'var(--bg-subtle)',
                        color: mood >= star ? 'var(--warning)' : 'var(--text-subtle)',
                      }}
                    >
                      <Star size={18} fill={mood >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Retrospective & Notes
                </label>
                <textarea
                  rows={4}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What went well today? What will you tackle tomorrow?"
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsFinishingDay(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Retrospective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
