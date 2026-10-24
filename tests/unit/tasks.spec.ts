import { describe, it, expect } from 'vitest';
import { createTask, updateTaskSchedule, isTodayTask, getTodayDateString } from '../../src/domain/tasks';
import { TODAY_TAG_ID } from '../../src/types';

describe('Task Domain Logic & ADR Invariants', () => {
  it('enforces ADR #1: dueDay and dueWithTime mutual exclusivity on creation', () => {
    const taskTimed = createTask({
      title: 'Timed Task',
      dueWithTime: 1735689600000,
      dueDay: '2026-01-01',
    });
    expect(taskTimed.dueWithTime).toBe(1735689600000);
    expect(taskTimed.dueDay).toBeNull();

    const taskDay = createTask({
      title: 'Day Task',
      dueDay: '2026-05-15',
    });
    expect(taskDay.dueDay).toBe('2026-05-15');
    expect(taskDay.dueWithTime).toBeNull();
  });

  it('enforces ADR #1 on schedule update', () => {
    let task = createTask({ title: 'Dynamic Task', dueDay: '2026-06-01' });
    expect(task.dueDay).toBe('2026-06-01');
    expect(task.dueWithTime).toBeNull();

    // Setting dueWithTime must clear dueDay
    task = updateTaskSchedule(task, { dueWithTime: 1735695000000 });
    expect(task.dueWithTime).toBe(1735695000000);
    expect(task.dueDay).toBeNull();

    // Setting dueDay must clear dueWithTime
    task = updateTaskSchedule(task, { dueDay: '2026-07-20' });
    expect(task.dueDay).toBe('2026-07-20');
    expect(task.dueWithTime).toBeNull();
  });

  it('enforces ADR #2: TODAY_TAG_ID is never added to task.tagIds', () => {
    const task = createTask({
      title: 'Virtual Today Check',
      tagIds: ['work', TODAY_TAG_ID, 'urgent'],
    });
    expect(task.tagIds).toEqual(['work', 'urgent']);
    expect(task.tagIds.includes(TODAY_TAG_ID)).toBe(false);
  });

  it('computes isTodayTask accurately for both dueDay and dueWithTime', () => {
    const today = getTodayDateString();
    const taskToday = createTask({ title: 'Today Task', dueDay: today });
    expect(isTodayTask(taskToday, today)).toBe(true);

    const taskTomorrow = createTask({ title: 'Tomorrow Task', dueDay: '2099-01-01' });
    expect(isTodayTask(taskTomorrow, today)).toBe(false);

    const nowMs = Date.now();
    const taskWithCurrentTime = createTask({ title: 'Now Task', dueWithTime: nowMs });
    expect(isTodayTask(taskWithCurrentTime, today)).toBe(true);
  });
});
