# FocusFlow — Reverse Engineering Specification & Evidence Log

## 1. Executive Summary & Provenance
FocusFlow is an enterprise-grade, local-first personal productivity and time-tracking application inspired by the functionality and architecture of [Super Productivity](https://github.com/super-productivity/super-productivity.git) (licensed under MIT, Copyright (c) 2018 Johannes Millan). FocusFlow maintains its own brand identity, visual design system, modular architecture, and modern TypeScript implementation.

This document records the exact reverse-engineering findings obtained by analyzing the reference repository source code at `reference/super-productivity`.

---

## 2. Source-Level Architectural Audit

### 2.1 State Management & Architecture
In the reference implementation (`src/app/`):
- **Core State Engine**: NgRx Store with action reducers, meta-reducers, entity adapters (`@ngrx/entity`), and effects.
- **Root Store Layout**:
  - `task`: Task entities, active task ID (`currentTaskId`), selected task ID (`selectedTaskId`), panel states.
  - `project`: Project entities, project task ordering, backlog task ordering, project theme overrides, custom configs.
  - `tag`: Tag entities, tag-specific task ordering. Virtual tag `TODAY_TAG` (ID `'TODAY'`) dynamically computed based on `dueDay` or `dueWithTime`.
  - `globalConfig`: Application settings, idle detection thresholds, pomodoro/take-a-break configurations, keyboard shortcuts, sync configuration, theme configs.
  - `planner`: Calendar day planning, task day projections, day notes.
  - `boards`: Kanban and Eisenhower board configurations with panels filtering by tag IDs, completion status, and scheduling state.
  - `metric`: Daily productivity metrics, mood/energy ratings, focus session logs, activity heatmaps.
  - `simpleCounter`: Habit/counter tracking with streak calculations, counter types (click vs. stopwatch).
  - `note`: Sticky notes and scratchpad notes per project/tag context.
  - `issueProvider`: Configuration for issue trackers (GitHub, Jira, GitLab, OpenProject, CalDAV).

### 2.2 Invariants & Architectural Decision Records (ADRs)
Based on `ARCHITECTURE-DECISIONS.md`:
1. **dueDay vs. dueWithTime Mutual Exclusivity**:
   - `task.dueWithTime` (timestamp in ms) and `task.dueDay` (ISO string `YYYY-MM-DD`) are mutually exclusive in new/updated data.
   - Setting `dueWithTime` clears `dueDay` (`undefined`/`null`).
   - When reading, `dueWithTime` takes precedence.
2. **Virtual TODAY_TAG Pattern**:
   - `TODAY_TAG` (`id: 'TODAY'`) is virtual.
   - `TODAY_TAG.id` must **never** be persisted in `task.tagIds`. Membership is computed by date. The tag entity only stores custom user ordering of today's tasks.
3. **Timer & Time Tracking Invariants**:
   - Time spent is stored in milliseconds both as an aggregate `timeSpent` and broken down by date in `timeSpentOnDay: { [dateStr: string]: number }`.
   - Only **one** task can have an active timer at any given moment. Starting a timer on Task B automatically pauses Task A.
   - Elapsed time must be calculated using wall-clock delta (`Date.now() - startTime`) rather than simple interval tick counting, ensuring accurate tracking across system sleep, tab throttling, and restarts.
4. **Focus Mode State Machine**:
   - Supports 3 modes: **Pomodoro** (fixed work interval + short/long break cycles), **Flowtime** (unbounded work interval until user pauses, followed by proportional break), and **Countdown** (custom target duration).
   - Break timer optionally pauses task tracking (`isPauseTrackingDuringBreak`).
5. **Data Storage & Sync**:
   - Stored in IndexedDB / LocalStorage with schema versioning.
   - Export/Import JSON format includes all state slices: `task`, `project`, `tag`, `globalConfig`, `reminders`, `planner`, `boards`, `note`, `metric`, `simpleCounter`, `taskRepeatCfg`, and `taskArchive`.

---

## 3. Subsystem Detailed Mapping

| Subsystem | Reference Location | Key Interfaces & Files | FocusFlow Implementation Strategy |
| :--- | :--- | :--- | :--- |
| **Tasks** | `src/app/features/tasks` | `task.model.ts`, `task.service.ts` | Normalized store (`tasksById`, `allIds`), subtasks, priorities (1=Low, 2=Med, 3=High), estimates, timeSpentOnDay |
| **Projects** | `src/app/features/project` | `project.model.ts`, `project.service.ts` | Projects with backlog support, custom colors, ordering, archive & completion semantics |
| **Tags & Context** | `src/app/features/tag`, `work-context` | `tag.model.ts`, `work-context.model.ts` | Unified WorkContext (Project or Tag), virtual Today tag, custom icon/color tags |
| **Time Tracking** | `src/app/features/time-tracking` | `time-tracking.service.ts` | Real-time ticker with wall-clock diff, idle detection simulation, per-day task breakdown |
| **Focus Sessions** | `src/app/features/focus-mode` | `focus-mode.service.ts`, strategies | Full Pomodoro (25/5/15), Flowtime, Countdown, audio feedback, break state transitions |
| **Planner & Schedule** | `src/app/features/planner`, `schedule` | `planner.model.ts`, `schedule.service.ts` | Visual daily timeline (00:00 - 24:00), drag-and-drop scheduling, overlap detection |
| **Boards** | `src/app/features/boards` | `boards.const.ts`, `boards.model.ts` | Eisenhower Matrix (4 quadrants) & Kanban (Todo, In Progress, Done) with tag/state filters |
| **Analytics & Metrics**| `src/app/features/metric`, `worklog` | `metric.service.ts`, `worklog.service.ts` | Worklog daily/weekly breakdown, export to CSV/JSON, activity streaks, productivity rating |
| **Habits & Counters** | `src/app/features/simple-counter` | `simple-counter.model.ts` | Click counters & stopwatch timers with streak calculation |
| **Integrations** | `src/app/features/issue`, `calendar` | `issue.model.ts`, `caldav.service.ts` | Pluggable issue sync framework (GitHub, Jira, GitLab, CalDAV/iCal) |
| **Data & Storage** | `src/app/imex`, `core/persistence` | `sync.model.ts`, `storage-keys.const.ts` | IndexedDB persistent engine, automatic backup, export/import, snapshot restore |

---

## 4. Reverse Engineering Conclusion
The reference application is comprehensive and battle-tested. FocusFlow adapts these core patterns into a modern, fast, and modular TypeScript architecture without Angular overhead, guaranteeing full parity on data integrity, state transitions, and user workflows.
