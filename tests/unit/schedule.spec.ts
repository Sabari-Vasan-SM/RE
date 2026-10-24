import { describe, it, expect } from 'vitest';
import { computeDailyScheduleBlocks } from '../../src/domain/schedule';
import { createTask } from '../../src/domain/tasks';

describe('Schedule Timeline & Conflict Engine', () => {
  it('correctly maps timed tasks and detects schedule conflicts', () => {
    const baseTime = new Date('2026-10-24T10:00:00').getTime();

    // Block 1: 10:00 - 11:00 (1 hour = 3600000 ms)
    const task1 = createTask({
      title: 'Meeting 1',
      dueWithTime: baseTime,
      timeEstimate: 3600000,
    });

    // Block 2: 10:30 - 11:30 (overlaps with Block 1!)
    const task2 = createTask({
      title: 'Overlapping Meeting',
      dueWithTime: baseTime + 1800000,
      timeEstimate: 3600000,
    });

    // Block 3: 13:00 - 14:00 (no overlap)
    const task3 = createTask({
      title: 'Deep Work Slot',
      dueWithTime: baseTime + 3 * 3600000,
      timeEstimate: 3600000,
    });

    const blocks = computeDailyScheduleBlocks([task1, task2, task3], '2026-10-24');
    expect(blocks.length).toBe(3);

    // Block 1 & 2 should flag conflict
    expect(blocks[0].hasConflict).toBe(true);
    expect(blocks[1].hasConflict).toBe(true);

    // Block 3 has no conflict
    expect(blocks[2].hasConflict).toBe(false);
  });
});
