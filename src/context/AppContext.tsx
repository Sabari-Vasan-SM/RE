import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AppDataComplete,
  Task,
  Project,
  Tag,
  SimpleCounter,
  DailyNote,
  FocusSessionState,
  TaskPriority,
} from '../types';
import {
  loadStateFromStorage,
  saveStateToStorage,
  exportBackupJSON,
  importBackupJSON,
} from '../storage/db';
import {
  createTask as domainCreateTask,
  updateTaskSchedule,
  toggleTaskDone as domainToggleTaskDone,
  addSubtask as domainAddSubtask,
  getTodayDateString,
} from '../domain/tasks';
import { createProject as domainCreateProject, toggleProjectDone as domainToggleProjectDone } from '../domain/projects';
import { accrueTime, switchActiveTask } from '../domain/time-tracking';
import {
  createInitialFocusSession,
  startFocusSession,
  pauseFocusSession,
  tickFocusSession,
  skipBreak,
  resetFocusSession,
} from '../domain/focus-mode';
import { playFocusStartChime, playPomodoroCompleteChime, playBreakEndChime } from '../domain/sound';

export type ActiveView =
  | 'TODAY'
  | 'PROJECTS'
  | 'PLANNER'
  | 'SCHEDULE'
  | 'BOARDS'
  | 'HABITS'
  | 'REPORTS'
  | 'SETTINGS';

interface AppContextType {
  state: AppDataComplete;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  activeTagId: string | null;
  setActiveTagId: (id: string | null) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isFocusOverlayOpen: boolean;
  setIsFocusOverlayOpen: (open: boolean) => void;
  isIntegrationsModalOpen: boolean;
  setIsIntegrationsModalOpen: (open: boolean) => void;
  focusSession: FocusSessionState;
  
  // Task Operations
  addTask: (params: {
    title: string;
    projectId?: string | null;
    tagIds?: string[];
    priority?: TaskPriority | null;
    dueDay?: string | null;
    dueWithTime?: number | null;
    timeEstimate?: number;
    notes?: string;
  }) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskDone: (taskId: string) => void;
  addSubtask: (parentId: string, title: string) => void;
  scheduleTask: (taskId: string, dueDay?: string | null, dueWithTime?: number | null) => void;
  
  // Timer & Focus Operations
  toggleActiveTaskTimer: (taskId: string) => void;
  startFocus: (taskId?: string | null) => void;
  pauseFocus: () => void;
  skipFocusBreak: () => void;
  resetFocus: () => void;
  setFocusMode: (mode: 'POMODORO' | 'FLOWTIME' | 'COUNTDOWN') => void;

  // Projects & Tags
  addProject: (title: string, color?: string, description?: string) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  toggleProjectComplete: (projectId: string) => void;

  // Habits & Retrospective
  incrementHabit: (counterId: string) => void;
  saveDailyNote: (note: DailyNote) => void;

  // System & Backup
  toggleTheme: () => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppDataComplete>(() => loadStateFromStorage());
  const [activeView, setActiveView] = useState<ActiveView>('TODAY');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState<boolean>(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState<boolean>(false);
  
  const [focusSession, setFocusSession] = useState<FocusSessionState>(() =>
    createInitialFocusSession(state.focusConfig)
  );

  const lastTickRef = useRef<number>(Date.now());

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Persistent auto-save on state change
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Master 1-second Wall-Clock Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;

      // 1. Accrue task time if a timer is active
      if (state.currentTaskId) {
        setState((prev) => {
          if (!prev.currentTaskId) return prev;
          const updatedTasks = accrueTime(prev.tasks, prev.currentTaskId, deltaMs);
          return {
            ...prev,
            tasks: updatedTasks,
          };
        });
      }

      // 2. Tick Focus Session if running
      setFocusSession((prev) => {
        if (!prev.isRunning) return prev;
        const tickRes = tickFocusSession(prev, deltaMs);

        if (tickRes.completedPhase === 'WORK') {
          if (prev.config.soundEnabled) playPomodoroCompleteChime();
        } else if (tickRes.completedPhase === 'SHORT_BREAK' || tickRes.completedPhase === 'LONG_BREAK') {
          if (prev.config.soundEnabled) playBreakEndChime();
        }

        return tickRes.session;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.currentTaskId]);

  // Task Operations
  const addTask = (params: {
    title: string;
    projectId?: string | null;
    tagIds?: string[];
    priority?: TaskPriority | null;
    dueDay?: string | null;
    dueWithTime?: number | null;
    timeEstimate?: number;
    notes?: string;
  }): Task => {
    const targetProjId = params.projectId !== undefined ? params.projectId : activeProjectId;
    const task = domainCreateTask({
      ...params,
      projectId: targetProjId,
    });

    setState((prev) => {
      const updatedTasks = { ...prev.tasks, [task.id]: task };
      let updatedProjects = { ...prev.projects };

      if (targetProjId && updatedProjects[targetProjId]) {
        updatedProjects[targetProjId] = {
          ...updatedProjects[targetProjId],
          taskIds: [task.id, ...updatedProjects[targetProjId].taskIds],
          updated: Date.now(),
        };
      }

      return {
        ...prev,
        tasks: updatedTasks,
        projects: updatedProjects,
      };
    });

    return task;
  };

  const updateTask = (task: Task) => {
    setState((prev) => ({
      ...prev,
      tasks: { ...prev.tasks, [task.id]: { ...task, updated: Date.now() } },
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => {
      const { [taskId]: deleted, ...remainingTasks } = prev.tasks;
      const newCurrentId = prev.currentTaskId === taskId ? null : prev.currentTaskId;

      const updatedProjects = { ...prev.projects };
      for (const p of Object.values(updatedProjects)) {
        if (p.taskIds.includes(taskId) || p.backlogTaskIds.includes(taskId)) {
          updatedProjects[p.id] = {
            ...p,
            taskIds: p.taskIds.filter((id) => id !== taskId),
            backlogTaskIds: p.backlogTaskIds.filter((id) => id !== taskId),
          };
        }
      }

      return {
        ...prev,
        tasks: remainingTasks,
        projects: updatedProjects,
        currentTaskId: newCurrentId,
      };
    });

    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const toggleTaskDone = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks[taskId];
      if (!task) return prev;
      const updatedTask = domainToggleTaskDone(task);
      const newCurrentId = updatedTask.isDone && prev.currentTaskId === taskId ? null : prev.currentTaskId;

      return {
        ...prev,
        tasks: { ...prev.tasks, [taskId]: updatedTask },
        currentTaskId: newCurrentId,
      };
    });
  };

  const addSubtask = (parentId: string, title: string) => {
    const subtask = domainCreateTask({ title, parentId });
    setState((prev) => {
      const parent = prev.tasks[parentId];
      if (!parent) return prev;
      const { parent: updatedParent, subtask: updatedSubtask } = domainAddSubtask(parent, subtask);
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [parent.id]: updatedParent,
          [subtask.id]: updatedSubtask,
        },
      };
    });
  };

  const scheduleTask = (taskId: string, dueDay?: string | null, dueWithTime?: number | null) => {
    setState((prev) => {
      const task = prev.tasks[taskId];
      if (!task) return prev;
      const updated = updateTaskSchedule(task, { dueDay, dueWithTime });
      return {
        ...prev,
        tasks: { ...prev.tasks, [taskId]: updated },
      };
    });
  };

  const toggleActiveTaskTimer = (taskId: string) => {
    setState((prev) => {
      const { newActiveId } = switchActiveTask(prev.currentTaskId, taskId);
      return {
        ...prev,
        currentTaskId: newActiveId,
      };
    });
  };

  // Focus Mode
  const startFocus = (taskId?: string | null) => {
    const targetTaskId = taskId !== undefined ? taskId : state.currentTaskId;
    setFocusSession((prev) => startFocusSession(prev, targetTaskId));
    if (targetTaskId && state.currentTaskId !== targetTaskId) {
      toggleActiveTaskTimer(targetTaskId);
    }
    if (focusSession.config.soundEnabled) {
      playFocusStartChime();
    }
  };

  const pauseFocus = () => {
    setFocusSession((prev) => pauseFocusSession(prev));
  };

  const skipFocusBreak = () => {
    setFocusSession((prev) => skipBreak(prev));
  };

  const resetFocus = () => {
    setFocusSession((prev) => resetFocusSession(prev));
  };

  const setFocusMode = (mode: 'POMODORO' | 'FLOWTIME' | 'COUNTDOWN') => {
    setFocusSession((prev) => ({
      ...prev,
      mode,
      elapsedMs: 0,
      phase: 'IDLE',
      isRunning: false,
    }));
  };

  // Projects
  const addProject = (title: string, color?: string, description?: string): Project => {
    const proj = domainCreateProject({ title, color, description });
    setState((prev) => ({
      ...prev,
      projects: { ...prev.projects, [proj.id]: proj },
    }));
    return proj;
  };

  const updateProject = (project: Project) => {
    setState((prev) => ({
      ...prev,
      projects: { ...prev.projects, [project.id]: { ...project, updated: Date.now() } },
    }));
  };

  const deleteProject = (projectId: string) => {
    setState((prev) => {
      const { [projectId]: deleted, ...remainingProjects } = prev.projects;
      return {
        ...prev,
        projects: remainingProjects,
      };
    });
    if (activeProjectId === projectId) setActiveProjectId(null);
  };

  const toggleProjectComplete = (projectId: string) => {
    setState((prev) => {
      const proj = prev.projects[projectId];
      if (!proj) return prev;
      const updated = domainToggleProjectDone(proj);
      return {
        ...prev,
        projects: { ...prev.projects, [projectId]: updated },
      };
    });
  };

  // Habits
  const incrementHabit = (counterId: string) => {
    setState((prev) => {
      const c = prev.counters[counterId];
      if (!c) return prev;
      const today = getTodayDateString();
      const isNewDay = c.lastUpdatedDay !== today;
      const newStreak = isNewDay ? c.streak + 1 : c.streak;
      const updated: SimpleCounter = {
        ...c,
        count: c.count + 1,
        streak: newStreak,
        lastUpdatedDay: today,
      };
      return {
        ...prev,
        counters: { ...prev.counters, [counterId]: updated },
      };
    });
  };

  // Retrospective Daily Note
  const saveDailyNote = (note: DailyNote) => {
    setState((prev) => ({
      ...prev,
      dailyNotes: {
        ...prev.dailyNotes,
        [note.date]: note,
      },
    }));
  };

  // System
  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const exportBackup = () => {
    const jsonStr = exportBackupJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonStr: string): boolean => {
    try {
      const restored = importBackupJSON(jsonStr);
      setState(restored);
      return true;
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        activeView,
        setActiveView,
        activeProjectId,
        setActiveProjectId,
        activeTagId,
        setActiveTagId,
        selectedTaskId,
        setSelectedTaskId,
        isFocusOverlayOpen,
        setIsFocusOverlayOpen,
        isIntegrationsModalOpen,
        setIsIntegrationsModalOpen,
        focusSession,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        addSubtask,
        scheduleTask,
        toggleActiveTaskTimer,
        startFocus,
        pauseFocus,
        skipFocusBreak,
        resetFocus,
        setFocusMode,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectComplete,
        incrementHabit,
        saveDailyNote,
        toggleTheme,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
