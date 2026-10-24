import { Task, TaskPriority, TODAY_TAG_ID } from '../types';

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createTask(params: {
  id?: string;
  title: string;
  projectId?: string | null;
  tagIds?: string[];
  parentId?: string | null;
  timeEstimate?: number;
  priority?: TaskPriority | null;
  dueDay?: string | null;
  dueWithTime?: number | null;
  notes?: string;
}): Task {
  const id = params.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  // ADR #2 Invariant: TODAY_TAG_ID must NEVER be saved in task.tagIds
  const sanitizedTagIds = (params.tagIds || []).filter((tid) => tid !== TODAY_TAG_ID);

  let dueDay = params.dueDay || null;
  let dueWithTime = params.dueWithTime || null;

  // ADR #1: Mutual exclusivity between dueDay and dueWithTime
  if (dueWithTime) {
    dueDay = null;
  } else if (dueDay) {
    dueWithTime = null;
  }

  return {
    id,
    title: params.title.trim(),
    notes: params.notes || '',
    projectId: params.projectId || null,
    tagIds: sanitizedTagIds,
    subTaskIds: [],
    parentId: params.parentId || null,
    isDone: false,
    doneOn: null,
    wontDoOn: null,
    priority: params.priority || null,
    timeEstimate: params.timeEstimate || 0,
    timeSpent: 0,
    timeSpentOnDay: {},
    dueDay,
    dueWithTime,
    created: now,
    updated: now,
  };
}

/**
 * ADR #1: Enforce mutual exclusivity when updating task schedule
 */
export function updateTaskSchedule(
  task: Task,
  schedule: { dueDay?: string | null; dueWithTime?: number | null }
): Task {
  let dueDay = schedule.dueDay !== undefined ? schedule.dueDay : task.dueDay;
  let dueWithTime = schedule.dueWithTime !== undefined ? schedule.dueWithTime : task.dueWithTime;

  if (schedule.dueWithTime !== undefined && schedule.dueWithTime !== null) {
    dueWithTime = schedule.dueWithTime;
    dueDay = null; // Clear dueDay when setting dueWithTime
  } else if (schedule.dueDay !== undefined && schedule.dueDay !== null) {
    dueDay = schedule.dueDay;
    dueWithTime = null; // Clear dueWithTime when setting dueDay
  }

  return {
    ...task,
    dueDay,
    dueWithTime,
    updated: Date.now(),
  };
}

/**
 * Evaluates whether a task belongs to Today
 */
export function isTodayTask(task: Task, targetDateStr: string = getTodayDateString()): boolean {
  if (task.dueWithTime) {
    const taskDateStr = getTodayDateString(new Date(task.dueWithTime));
    return taskDateStr === targetDateStr;
  }
  if (task.dueDay) {
    return task.dueDay === targetDateStr;
  }
  return false;
}

export function toggleTaskDone(task: Task, isDone?: boolean): Task {
  const newDone = isDone !== undefined ? isDone : !task.isDone;
  const now = Date.now();
  return {
    ...task,
    isDone: newDone,
    doneOn: newDone ? now : null,
    updated: now,
  };
}

export function addSubtask(parent: Task, subtask: Task): { parent: Task; subtask: Task } {
  const updatedParent: Task = {
    ...parent,
    subTaskIds: Array.from(new Set([...parent.subTaskIds, subtask.id])),
    updated: Date.now(),
  };
  const updatedSubtask: Task = {
    ...subtask,
    parentId: parent.id,
    projectId: parent.projectId,
    updated: Date.now(),
  };
  return { parent: updatedParent, subtask: updatedSubtask };
}
