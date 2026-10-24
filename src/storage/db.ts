import { AppDataComplete, Task, Project, Tag, SimpleCounter } from '../types';
import { DEFAULT_TAGS } from '../domain/tags';
import { DEFAULT_FOCUS_CONFIG } from '../domain/focus-mode';
import { createTask } from '../domain/tasks';
import { createProject } from '../domain/projects';

const STORAGE_KEY = 'FOCUS_FLOW_APP_DATA_V1';

export function createDefaultState(): AppDataComplete {
  const initialProject = createProject({
    title: 'FocusFlow Welcome',
    description: 'Learn the core features of FocusFlow',
    color: '#3b82f6',
  });

  const task1 = createTask({
    title: 'Explore FocusFlow Today Dashboard',
    projectId: initialProject.id,
    timeEstimate: 15 * 60 * 1000,
    dueDay: new Date().toISOString().split('T')[0],
    notes: 'Welcome! Press the Play button to track precision time on this task.',
  });

  const task2 = createTask({
    title: 'Test Pomodoro Focus Session',
    projectId: initialProject.id,
    timeEstimate: 25 * 60 * 1000,
    dueDay: new Date().toISOString().split('T')[0],
    notes: 'Click Focus Mode in the top bar to experience a full 25-minute Pomodoro with audio chimes.',
  });

  const task3 = createTask({
    title: 'Organize Tasks with Eisenhower Matrix & Kanban',
    projectId: initialProject.id,
    timeEstimate: 20 * 60 * 1000,
    notes: 'Switch to the Boards view to see automatic quadrant filtering and Kanban columns.',
  });

  initialProject.taskIds = [task1.id, task2.id, task3.id];

  const tasksMap: Record<string, Task> = {
    [task1.id]: task1,
    [task2.id]: task2,
    [task3.id]: task3,
  };

  const projectsMap: Record<string, Project> = {
    [initialProject.id]: initialProject,
  };

  const tagsMap: Record<string, Tag> = {};
  for (const tag of DEFAULT_TAGS) {
    tagsMap[tag.id] = tag;
  }

  const countersMap: Record<string, SimpleCounter> = {
    counter_water: {
      id: 'counter_water',
      title: 'Water Glasses (8 oz)',
      count: 3,
      streak: 5,
      lastUpdatedDay: new Date().toISOString().split('T')[0],
      color: '#06b6d4',
    },
    counter_deep_work: {
      id: 'counter_deep_work',
      title: 'Deep Work Blocks',
      count: 2,
      streak: 4,
      lastUpdatedDay: new Date().toISOString().split('T')[0],
      color: '#8b5cf6',
    },
  };

  return {
    version: 1,
    timestamp: Date.now(),
    tasks: tasksMap,
    projects: projectsMap,
    tags: tagsMap,
    counters: countersMap,
    dailyNotes: {},
    currentTaskId: null,
    integrations: {
      GITHUB: { provider: 'GITHUB', isEnabled: false },
      JIRA: { provider: 'JIRA', isEnabled: false },
      GITLAB: { provider: 'GITLAB', isEnabled: false },
      CALDAV: { provider: 'CALDAV', isEnabled: false },
    },
    focusConfig: DEFAULT_FOCUS_CONFIG,
    theme: 'dark',
  };
}

export function saveStateToStorage(state: AppDataComplete): void {
  try {
    const payload = JSON.stringify({
      ...state,
      timestamp: Date.now(),
    });
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function loadStateFromStorage(): AppDataComplete {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = createDefaultState();
      saveStateToStorage(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.tasks) {
      return createDefaultState();
    }
    return parsed as AppDataComplete;
  } catch (err) {
    console.warn('Error reading stored state, falling back to initial default:', err);
    return createDefaultState();
  }
}

export function exportBackupJSON(state: AppDataComplete): string {
  return JSON.stringify(state, null, 2);
}

export function importBackupJSON(jsonString: string): AppDataComplete {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object' || !parsed.tasks || !parsed.projects) {
    throw new Error('Invalid FocusFlow backup format: Missing tasks or projects records.');
  }
  return {
    ...parsed,
    timestamp: Date.now(),
  };
}
