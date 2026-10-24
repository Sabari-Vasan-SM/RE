import { Task, BoardCfg, URGENT_TAG_ID, IMPORTANT_TAG_ID, IN_PROGRESS_TAG_ID } from '../types';

export const EISENHOWER_BOARD: BoardCfg = {
  id: 'EISENHOWER_MATRIX',
  title: 'Eisenhower Matrix',
  columns: 2,
  panels: [
    {
      id: 'URGENT_AND_IMPORTANT',
      title: 'Urgent & Important (Do First)',
      taskDoneState: 'ALL',
      includedTagIds: [URGENT_TAG_ID, IMPORTANT_TAG_ID],
      excludedTagIds: [],
    },
    {
      id: 'NOT_URGENT_AND_IMPORTANT',
      title: 'Not Urgent & Important (Schedule)',
      taskDoneState: 'ALL',
      includedTagIds: [IMPORTANT_TAG_ID],
      excludedTagIds: [URGENT_TAG_ID],
    },
    {
      id: 'URGENT_AND_NOT_IMPORTANT',
      title: 'Urgent & Not Important (Delegate)',
      taskDoneState: 'ALL',
      includedTagIds: [URGENT_TAG_ID],
      excludedTagIds: [IMPORTANT_TAG_ID],
    },
    {
      id: 'NOT_URGENT_AND_NOT_IMPORTANT',
      title: 'Neither Urgent Nor Important (Eliminate)',
      taskDoneState: 'ALL',
      includedTagIds: [],
      excludedTagIds: [URGENT_TAG_ID, IMPORTANT_TAG_ID],
    },
  ],
};

export const KANBAN_BOARD: BoardCfg = {
  id: 'KANBAN_DEFAULT',
  title: 'Kanban Board',
  columns: 3,
  panels: [
    {
      id: 'TODO',
      title: 'To Do',
      taskDoneState: 'UNDONE',
      includedTagIds: [],
      excludedTagIds: [IN_PROGRESS_TAG_ID],
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      taskDoneState: 'UNDONE',
      includedTagIds: [IN_PROGRESS_TAG_ID],
      excludedTagIds: [],
    },
    {
      id: 'DONE',
      title: 'Done',
      taskDoneState: 'DONE',
      includedTagIds: [],
      excludedTagIds: [],
    },
  ],
};

export function filterTasksForPanel(tasks: Task[], panel: BoardCfg['panels'][0]): Task[] {
  return tasks.filter((t) => {
    // Check completion state
    if (panel.taskDoneState === 'DONE' && !t.isDone) return false;
    if (panel.taskDoneState === 'UNDONE' && t.isDone) return false;

    // Check excluded tags
    for (const excluded of panel.excludedTagIds) {
      if (t.tagIds.includes(excluded)) return false;
    }

    // Check included tags
    for (const included of panel.includedTagIds) {
      if (!t.tagIds.includes(included)) return false;
    }

    return true;
  });
}
