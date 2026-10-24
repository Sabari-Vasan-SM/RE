# FocusFlow — Data Model & Schema Specification

## 1. Core Data Entities

### 1.1 Task Model (`Task`)
```typescript
export interface Task {
  id: string;
  title: string;
  notes?: string;
  projectId: string | null;
  tagIds: string[];
  subTaskIds: string[];
  parentId?: string | null;
  
  // Status & Progress
  isDone: boolean;
  doneOn?: number | null;
  wontDoOn?: number | null;
  priority?: 1 | 2 | 3 | null; // 1: Low, 2: Medium, 3: High
  
  // Time Tracking (all in milliseconds)
  timeEstimate: number;
  timeSpent: number;
  timeSpentOnDay: Record<string, number>; // key: 'YYYY-MM-DD'
  
  // Scheduling (Mutual Exclusivity Pattern: ADR #1)
  dueDay?: string | null;       // 'YYYY-MM-DD' (all-day event)
  dueWithTime?: number | null;  // Epoch ms (specific time)
  deadlineDay?: string | null;
  deadlineWithTime?: number | null;
  
  // Reminders & Recurrence
  remindAt?: number | null;
  repeatCfgId?: string | null;
  
  // Metadata & Issue Tracking
  created: number;
  updated?: number;
  issueId?: string | null;
  issueProviderKey?: 'GITHUB' | 'JIRA' | 'GITLAB' | 'CALDAV' | null;
}
```

### 1.2 Project Model (`Project`)
```typescript
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
```

### 1.3 Tag Model (`Tag`)
```typescript
export interface Tag {
  id: string;
  title: string;
  color: string;
  icon?: string;
  taskIds: string[]; // Order of tasks within this tag
  created: number;
}

// Special Virtual Tags
export const TODAY_TAG_ID = 'TODAY';
export const IN_PROGRESS_TAG_ID = 'IN_PROGRESS';
export const URGENT_TAG_ID = 'URGENT';
export const IMPORTANT_TAG_ID = 'IMPORTANT';
```

### 1.4 Focus Session State (`FocusSession`)
```typescript
export type FocusMode = 'POMODORO' | 'FLOWTIME' | 'COUNTDOWN';
export type FocusPhase = 'IDLE' | 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface FocusSessionState {
  mode: FocusMode;
  phase: FocusPhase;
  isRunning: boolean;
  activeTaskId: string | null;
  
  sessionStart: number | null;
  durationMs: number;
  elapsedMs: number;
  
  completedPomodoros: number;
  pomodorosUntilLongBreak: number;
  
  config: {
    workDurationMs: number;      // default: 25 * 60 * 1000
    shortBreakDurationMs: number;// default: 5 * 60 * 1000
    longBreakDurationMs: number; // default: 15 * 60 * 1000
    cyclesBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
  };
}
```

### 1.5 Board Configuration (`BoardCfg`)
```typescript
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
```

### 1.6 Full Application State Bundle (`AppDataComplete`)
```typescript
export interface AppDataComplete {
  version: number;
  timestamp: number;
  tasks: Record<string, Task>;
  projects: Record<string, Project>;
  tags: Record<string, Tag>;
  metrics: {
    dailyLogs: Record<string, { mood?: number; notes?: string; totalTime: number }>;
  };
  counters: Record<string, { id: string; title: string; count: number; streak: number }>;
  notes: Record<string, { id: string; title: string; content: string; created: number }>;
  config: Record<string, unknown>;
  archive: {
    tasks: Record<string, Task>;
    projects: Record<string, Project>;
  };
}
```
