import { describe, it, expect } from 'vitest';
import { filterTasksForPanel, EISENHOWER_BOARD, KANBAN_BOARD } from '../../src/domain/boards';
import { createTask } from '../../src/domain/tasks';
import { URGENT_TAG_ID, IMPORTANT_TAG_ID, IN_PROGRESS_TAG_ID } from '../../src/types';

describe('Boards & Visual Task Matrix Filtering', () => {
  it('correctly filters tasks into the 4 Eisenhower Matrix quadrants', () => {
    const tUrgentImportant = createTask({
      title: 'Fix Critical Production Bug',
      tagIds: [URGENT_TAG_ID, IMPORTANT_TAG_ID],
    });
    const tImportantOnly = createTask({
      title: 'Refactor Core Architecture',
      tagIds: [IMPORTANT_TAG_ID],
    });
    const tUrgentOnly = createTask({
      title: 'Reply to Urgent Slack Message',
      tagIds: [URGENT_TAG_ID],
    });
    const tNeither = createTask({
      title: 'Read Random Blog Post',
      tagIds: [],
    });

    const allTasks = [tUrgentImportant, tImportantOnly, tUrgentOnly, tNeither];

    const q1 = filterTasksForPanel(allTasks, EISENHOWER_BOARD.panels[0]); // Urgent & Important
    expect(q1.map((t) => t.id)).toEqual([tUrgentImportant.id]);

    const q2 = filterTasksForPanel(allTasks, EISENHOWER_BOARD.panels[1]); // Not Urgent & Important
    expect(q2.map((t) => t.id)).toEqual([tImportantOnly.id]);

    const q3 = filterTasksForPanel(allTasks, EISENHOWER_BOARD.panels[2]); // Urgent & Not Important
    expect(q3.map((t) => t.id)).toEqual([tUrgentOnly.id]);

    const q4 = filterTasksForPanel(allTasks, EISENHOWER_BOARD.panels[3]); // Neither
    expect(q4.map((t) => t.id)).toEqual([tNeither.id]);
  });

  it('correctly partitions tasks across Kanban columns', () => {
    const tTodo = createTask({ title: 'Task 1' });
    const tInProgress = createTask({ title: 'Task 2', tagIds: [IN_PROGRESS_TAG_ID] });
    const tDone = createTask({ title: 'Task 3' });
    tDone.isDone = true;

    const allTasks = [tTodo, tInProgress, tDone];

    const colTodo = filterTasksForPanel(allTasks, KANBAN_BOARD.panels[0]);
    expect(colTodo.map((t) => t.id)).toEqual([tTodo.id]);

    const colInProgress = filterTasksForPanel(allTasks, KANBAN_BOARD.panels[1]);
    expect(colInProgress.map((t) => t.id)).toEqual([tInProgress.id]);

    const colDone = filterTasksForPanel(allTasks, KANBAN_BOARD.panels[2]);
    expect(colDone.map((t) => t.id)).toEqual([tDone.id]);
  });
});
