import { Tag, TODAY_TAG_ID, IN_PROGRESS_TAG_ID, URGENT_TAG_ID, IMPORTANT_TAG_ID } from '../types';

export const DEFAULT_TAGS: Tag[] = [
  {
    id: TODAY_TAG_ID,
    title: 'Today',
    color: '#3b82f6',
    icon: 'Sun',
    taskIds: [],
    created: 0,
  },
  {
    id: IN_PROGRESS_TAG_ID,
    title: 'In Progress',
    color: '#f59e0b',
    icon: 'Clock',
    taskIds: [],
    created: 0,
  },
  {
    id: URGENT_TAG_ID,
    title: 'Urgent',
    color: '#ef4444',
    icon: 'AlertCircle',
    taskIds: [],
    created: 0,
  },
  {
    id: IMPORTANT_TAG_ID,
    title: 'Important',
    color: '#8b5cf6',
    icon: 'Star',
    taskIds: [],
    created: 0,
  },
];

export function createTag(title: string, color: string = '#64748b', icon?: string): Tag {
  const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    title: title.trim(),
    color,
    icon,
    taskIds: [],
    created: Date.now(),
  };
}
