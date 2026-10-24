// FocusFlow Domain Types and Invariants

export type TaskPriority = 1 | 2 | 3; // 1 = Low, 2 = Medium, 3 = High

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: 'LINK' | 'FILE';
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  projectId: string | null;
  tagIds: string[];
  subTaskIds: string[];
  parentId?: string | null;

  // Status & Completion
  isDone: boolean;
  doneOn?: number | null;
  wontDoOn?: number | null;
  priority?: TaskPriority | null;

  // Time Tracking (milliseconds)
  timeEstimate: number;
  timeSpent: number;
  timeSpentOnDay: Record<string, number>; // key: 'YYYY-MM-DD'

  // Scheduling (ADR #1: Mutual exclusivity between dueDay and dueWithTime)
  dueDay?: string | null;       // 'YYYY-MM-DD' for all-day scheduled tasks
  dueWithTime?: number | null;  // Unix timestamp (ms) for timed tasks
  deadlineDay?: string | null;
  deadlineWithTime?: number | null;
  deadlineRemindAt?: number | null;

  // Reminders & Recurrence
  remindAt?: number | null;
  repeatCfgId?: string | null;

  // Creation & Issue Integration
  created: number;
  updated?: number;
  issueId?: string | null;
  issueProviderKey?: 'GITHUB' | 'JIRA' | 'GITLAB' | 'CALDAV' | null;
  issueUrl?: string | null;

  // UI state
  _isExpanded?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
  isArchived?: boolean;
  isDone?: boolean;
  doneOn?: number | null;
  isEnableBacklog?: boolean;
  taskIds: string[];
  backlogTaskIds: string[];
  noteIds: string[];
  created: number;
  updated?: number;
}

export interface Tag {
  id: string;
  title: string;
  color: string;
  icon?: string;
  taskIds: string[];
  created: number;
}

// Virtual Tag Invariants (ADR #2)
export const TODAY_TAG_ID = 'TODAY';
export const IN_PROGRESS_TAG_ID = 'IN_PROGRESS';
export const URGENT_TAG_ID = 'URGENT';
export const IMPORTANT_TAG_ID = 'IMPORTANT';

export type FocusMode = 'POMODORO' | 'FLOWTIME' | 'COUNTDOWN';
export type FocusPhase = 'IDLE' | 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface FocusConfig {
  workDurationMs: number;        // e.g. 25 * 60 * 1000
  shortBreakDurationMs: number;  // e.g. 5 * 60 * 1000
  longBreakDurationMs: number;   // e.g. 15 * 60 * 1000
  cyclesBeforeLongBreak: number; // e.g. 4
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
}

export interface FocusSessionState {
  mode: FocusMode;
  phase: FocusPhase;
  isRunning: boolean;
  activeTaskId: string | null;
  sessionStart: number | null;
  durationMs: number;
  elapsedMs: number;
  completedPomodoros: number;
  config: FocusConfig;
}

export interface SimpleCounter {
  id: string;
  title: string;
  count: number;
  streak: number;
  lastUpdatedDay: string; // 'YYYY-MM-DD'
  color: string;
}

export interface DailyNote {
  date: string; // 'YYYY-MM-DD'
  content: string;
  moodRating?: number; // 1 to 5
}

export interface BoardPanel {
  id: string;
  title: string;
  taskDoneState: 'ALL' | 'DONE' | 'UNDONE';
  includedTagIds: string[];
  excludedTagIds: string[];
  isBacklogAllowed?: boolean;
}

export interface BoardCfg {
  id: string;
  title: string;
  columns: number;
  panels: BoardPanel[];
}

export interface IntegrationConfig {
  provider: 'GITHUB' | 'JIRA' | 'GITLAB' | 'CALDAV';
  isEnabled: boolean;
  token?: string;
  username?: string;
  host?: string;
  queryOrCalendarUrl?: string;
  lastSync?: number;
}

export interface AppDataComplete {
  version: number;
  timestamp: number;
  tasks: Record<string, Task>;
  projects: Record<string, Project>;
  tags: Record<string, Tag>;
  counters: Record<string, SimpleCounter>;
  dailyNotes: Record<string, DailyNote>;
  currentTaskId: string | null;
  integrations: Record<string, IntegrationConfig>;
  focusConfig: FocusConfig;
  theme: 'dark' | 'light' | 'system';
}
