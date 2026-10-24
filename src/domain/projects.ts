import { Project } from '../types';

export const DEFAULT_PROJECT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export function createProject(params: {
  id?: string;
  title: string;
  description?: string;
  color?: string;
  isEnableBacklog?: boolean;
}): Project {
  const now = Date.now();
  return {
    id: params.id || `project_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: params.title.trim(),
    description: params.description || '',
    color: params.color || DEFAULT_PROJECT_COLORS[0],
    isArchived: false,
    isDone: false,
    doneOn: null,
    isEnableBacklog: params.isEnableBacklog ?? true,
    taskIds: [],
    backlogTaskIds: [],
    noteIds: [],
    created: now,
    updated: now,
  };
}

export function toggleProjectDone(project: Project): Project {
  const newDone = !project.isDone;
  const now = Date.now();
  return {
    ...project,
    isDone: newDone,
    doneOn: newDone ? now : null,
    // In Super Productivity ADR #5, completing a project also archives it from active navigation
    isArchived: newDone ? true : project.isArchived,
    updated: now,
  };
}

export function moveTaskToBacklog(project: Project, taskId: string): Project {
  const taskIds = project.taskIds.filter((id) => id !== taskId);
  const backlogTaskIds = Array.from(new Set([...project.backlogTaskIds, taskId]));
  return {
    ...project,
    taskIds,
    backlogTaskIds,
    updated: Date.now(),
  };
}

export function moveTaskToActive(project: Project, taskId: string): Project {
  const backlogTaskIds = project.backlogTaskIds.filter((id) => id !== taskId);
  const taskIds = Array.from(new Set([...project.taskIds, taskId]));
  return {
    ...project,
    taskIds,
    backlogTaskIds,
    updated: Date.now(),
  };
}
