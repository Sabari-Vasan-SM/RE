import { Task } from '../types';
import { getTodayDateString } from './tasks';

export interface ScheduleBlock {
  taskId: string;
  title: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  isDone: boolean;
  priority: number | null;
  projectId: string | null;
  hasConflict?: boolean;
}

export function computeDailyScheduleBlocks(
  tasks: Task[],
  targetDateStr: string = getTodayDateString()
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];

  for (const t of tasks) {
    if (!t.dueWithTime) continue;
    const taskDateStr = getTodayDateString(new Date(t.dueWithTime));
    if (taskDateStr !== targetDateStr) continue;

    const durationMs = t.timeEstimate > 0 ? t.timeEstimate : 30 * 60 * 1000; // default 30m
    const startMs = t.dueWithTime;
    const endMs = startMs + durationMs;

    blocks.push({
      taskId: t.id,
      title: t.title,
      startMs,
      endMs,
      durationMs,
      isDone: t.isDone,
      priority: t.priority ?? null,
      projectId: t.projectId,
      hasConflict: false,
    });
  }

  // Sort chronologically
  blocks.sort((a, b) => a.startMs - b.startMs);

  // Mark conflicts
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      if (blocks[i].endMs > blocks[j].startMs) {
        blocks[i].hasConflict = true;
        blocks[j].hasConflict = true;
      }
    }
  }

  return blocks;
}

export function getHoursGrid(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

export function formatTimeSlot(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
