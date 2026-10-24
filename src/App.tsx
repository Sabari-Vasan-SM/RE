import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TodayView } from './components/planning/TodayView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { BoardsView } from './components/boards/BoardsView';
import { HabitsView } from './components/habits/HabitsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { ProjectView } from './components/projects/ProjectView';
import { TaskDetailPanel } from './components/tasks/TaskDetailPanel';
import { FocusOverlay } from './components/focus/FocusOverlay';
import { IntegrationsModal } from './components/integrations/IntegrationsModal';

export const AppContent: React.FC = () => {
  const {
    activeView,
    activeProjectId,
    setActiveView,
    setIsFocusOverlayOpen,
    setSelectedTaskId,
  } = useApp();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setIsFocusOverlayOpen(true);
      } else if (e.key === 'Escape') {
        setSelectedTaskId(null);
        setIsFocusOverlayOpen(false);
      } else if (e.key === '1') {
        setActiveView('TODAY');
      } else if (e.key === '2') {
        setActiveView('SCHEDULE');
      } else if (e.key === '3') {
        setActiveView('BOARDS');
      } else if (e.key === '4') {
        setActiveView('REPORTS');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    if (activeProjectId && activeView === 'PROJECTS') {
      return <ProjectView />;
    }
    switch (activeView) {
      case 'TODAY':
        return <TodayView />;
      case 'SCHEDULE':
        return <ScheduleView />;
      case 'BOARDS':
        return <BoardsView />;
      case 'HABITS':
        return <HabitsView />;
      case 'REPORTS':
        return <ReportsView />;
      case 'SETTINGS':
        return <SettingsView />;
      case 'PROJECTS':
        return <ProjectView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        {renderActiveView()}
      </div>

      {/* Global Modals & Slide-overs */}
      <TaskDetailPanel />
      <FocusOverlay />
      <IntegrationsModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
