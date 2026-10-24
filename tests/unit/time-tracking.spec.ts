import { describe, it, expect } from 'vitest';
import { accrueTime, switchActiveTask, formatDuration } from '../../src/domain/time-tracking';
import { createTask } from '../../src/domain/tasks';
import { Task } from '../../src/types';

describe('Time Tracking Domain Engine', () => {
  it('correctly accrues wall-clock time to active task total and timeSpentOnDay', () => {
    const task = createTask({ title: 'Coding Task' });
    let tasks: Record<string, Task> = { [task.id]: task };

    // Accrue 15 minutes (900,000 ms)
    tasks = accrueTime(tasks, task.id, 900000, '2026-10-24');

    expect(tasks[task.id].timeSpent).toBe(900000);
    expect(tasks[task.id].timeSpentOnDay['2026-10-24']).toBe(900000);

    // Accrue another 5 minutes on the same day
    tasks = accrueTime(tasks, task.id, 300000, '2026-10-24');
    expect(tasks[task.id].timeSpent).toBe(1200000);
    expect(tasks[task.id].timeSpentOnDay['2026-10-24']).toBe(1200000);

    // Accrue on next day
    tasks = accrueTime(tasks, task.id, 600000, '2026-10-25');
    expect(tasks[task.id].timeSpent).toBe(1800000);
    expect(tasks[task.id].timeSpentOnDay['2026-10-24']).toBe(1200000);
    expect(tasks[task.id].timeSpentOnDay['2026-10-25']).toBe(600000);
  });

  it('handles switching active tasks', () => {
    const res1 = switchActiveTask(null, 'task-1');
    expect(res1.newActiveId).toBe('task-1');

    // Clicking same task toggles it off
    const res2 = switchActiveTask('task-1', 'task-1');
    expect(res2.newActiveId).toBeNull();

    // Switching to task-2
    const res3 = switchActiveTask('task-1', 'task-2');
    expect(res3.newActiveId).toBe('task-2');
  });

  it('formats duration correctly', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(45 * 60 * 1000)).toBe('45m');
    expect(formatDuration(90 * 60 * 1000)).toBe('1h 30m');
    expect(formatDuration(65 * 1000, true)).toBe('1m 05s');
  });
});
