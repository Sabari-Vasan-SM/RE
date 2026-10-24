import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskList } from '../tasks/TaskList';
import { Plus, CheckCheck, Archive, Layers, Trash2 } from 'lucide-react';
import { TaskPriority } from '../../types';

export const ProjectView: React.FC = () => {
  const {
    state,
    activeProjectId,
    addTask,
    toggleProjectComplete,
    deleteProject,
    setActiveProjectId,
    setActiveView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'BACKLOG'>('ACTIVE');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>(null);

  const project = activeProjectId ? state.projects[activeProjectId] : null;

  if (!project) {
    return (
      <div className="scroll-area" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        Project not found. Select a project from the sidebar.
      </div>
    );
  }

  const allTasks = Object.values(state.tasks);
  const activeTasks = project.taskIds.map((id) => state.tasks[id]).filter(Boolean);
  const backlogTasks = project.backlogTaskIds.map((id) => state.tasks[id]).filter(Boolean);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      projectId: project.id,
      priority,
    });
    setTitle('');
  };

  return (
    <div className="scroll-area">
      {/* Project Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: project.color,
            }}
          />
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
              {project.title}
            </h1>
            {project.description && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Project Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => toggleProjectComplete(project.id)}
            className="btn btn-secondary"
            title="Complete and archive project"
          >
            <CheckCheck size={15} />
            <span>{project.isDone ? 'Reopen Project' : 'Complete Project'}</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete project "${project.title}"?`)) {
                deleteProject(project.id);
                setActiveProjectId(null);
                setActiveView('TODAY');
              }
            }}
            className="btn-icon"
            style={{ color: 'var(--danger)' }}
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs: Active Tasks vs Backlog */}
      {project.isEnableBacklog && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setActiveTab('ACTIVE')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'ACTIVE' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'ACTIVE' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            Active Tasks ({activeTasks.filter((t) => !t.isDone).length})
          </button>

          <button
            onClick={() => setActiveTab('BACKLOG')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'BACKLOG' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'BACKLOG' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            Backlog ({backlogTasks.length})
          </button>
        </div>
      )}

      {/* Quick Add Task */}
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
          placeholder={`Add task to ${project.title}...`}
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

        <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px' }}>
          <Plus size={15} />
          <span>Add</span>
        </button>
      </form>

      {/* Task List */}
      <TaskList
        tasks={activeTab === 'ACTIVE' ? activeTasks : backlogTasks}
        emptyMessage={
          activeTab === 'ACTIVE'
            ? 'No active tasks in this project. Create one above!'
            : 'Backlog is empty.'
        }
      />
    </div>
  );
};
