import React, { useState } from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import {
  Sun,
  Calendar,
  Clock,
  Columns,
  Activity,
  BarChart3,
  Settings,
  FolderPlus,
  Layers,
  ChevronRight,
  Sparkles,
  Link2,
} from 'lucide-react';
import { isTodayTask } from '../../domain/tasks';

export const Sidebar: React.FC = () => {
  const {
    state,
    activeView,
    setActiveView,
    activeProjectId,
    setActiveProjectId,
    addProject,
    setIsIntegrationsModalOpen,
  } = useApp();

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  // Calculate today task count
  const todayTasksCount = Object.values(state.tasks).filter(
    (t) => !t.isDone && isTodayTask(t)
  ).length;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const proj = addProject(newProjectTitle.trim());
    setNewProjectTitle('');
    setIsAddingProject(false);
    setActiveProjectId(proj.id);
    setActiveView('PROJECTS');
  };

  interface NavItem {
    id: ActiveView;
    label: string;
    icon: any;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'TODAY', label: 'Today', icon: Sun, badge: todayTasksCount },
    { id: 'SCHEDULE', label: 'Schedule', icon: Clock },
    { id: 'BOARDS', label: 'Boards', icon: Columns },
    { id: 'HABITS', label: 'Habits & Counters', icon: Activity },
    { id: 'REPORTS', label: 'Reports & Worklog', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
            }}
          >
            FocusFlow
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: -2 }}>
            Local-First Productivity
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && activeProjectId === null;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveProjectId(null);
                  setActiveView(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 13,
                  transition: 'background-color 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Section */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 12px',
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Projects
            </span>
            <button
              onClick={() => setIsAddingProject(!isAddingProject)}
              className="btn-icon"
              style={{ padding: 4 }}
              title="Add Project"
            >
              <FolderPlus size={14} />
            </button>
          </div>

          {isAddingProject && (
            <form onSubmit={handleCreateProject} style={{ padding: '6px 12px', marginBottom: 6 }}>
              <input
                type="text"
                autoFocus
                placeholder="Project title..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--primary-border)',
                  backgroundColor: 'var(--bg-card)',
                  outline: 'none',
                }}
              />
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Object.values(state.projects)
              .filter((p) => !p.isArchived)
              .map((proj) => {
                const isActive = activeView === 'PROJECTS' && activeProjectId === proj.id;
                const activeTaskCount = proj.taskIds.filter((id) => state.tasks[id] && !state.tasks[id].isDone).length;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProjectId(proj.id);
                      setActiveView('PROJECTS');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: proj.color || 'var(--primary)',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {proj.title}
                      </span>
                    </div>
                    {activeTaskCount > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{activeTaskCount}</span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Integrations Hub trigger in footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => setIsIntegrationsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <Link2 size={14} />
          <span>Integrations (GitHub, Jira)</span>
        </button>
      </div>
    </aside>
  );
};
