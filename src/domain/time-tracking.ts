import { Task } from '../types';
import { getTodayDateString } from './tasks';

export interface TimeTrackingSession {
  activeTaskId: string | null;
  lastTickTime: number | null;
}

/**
 * Accrues elapsed wall-clock time to the active task
 */
export function accrueTime(
  tasks: Record<string, Task>,
  activeTaskId: string | null,
  deltaMs: number,
  targetDateStr: string = getTodayDateString()
): Record<string, Task> {
  if (!activeTaskId || deltaMs <= 0 || !tasks[activeTaskId]) {
    return tasks;
  }

  const currentTask = tasks[activeTaskId];
  const currentDaySpent = currentTask.timeSpentOnDay[targetDateStr] || 0;

  const updatedTask: Task = {
    ...currentTask,
    timeSpent: currentTask.timeSpent + deltaMs,
    timeSpentOnDay: {
      ...currentTask.timeSpentOnDay,
      [targetDateStr]: currentDaySpent + deltaMs,
    },
    updated: Date.now(),
  };

  return {
    ...tasks,
    [activeTaskId]: updatedTask,
  };
}

/**
 * Switches the active task timer to a new task (or pauses if same task or null)
 */
export function switchActiveTask(
  currentActiveId: string | null,
  targetTaskId: string | null
): {
  newActiveId: string | null;
  timestamp: number;
} {
  const now = Date.now();
  if (currentActiveId === targetTaskId) {
    // Toggling off
    return { newActiveId: null, timestamp: now };
  }
  return { newActiveId: targetTaskId, timestamp: now };
}

export function formatDuration(ms: number, includeSeconds: boolean = false): string {
  if (ms <= 0 || isNaN(ms)) return includeSeconds ? '0m 00s' : '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    if (includeSeconds) {
      return `${hours}h ${minutes}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${hours}h ${minutes}m`;
  }
  if (includeSeconds) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${minutes}m`;
}
