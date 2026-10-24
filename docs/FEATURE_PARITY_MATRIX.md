# FocusFlow — Feature Parity Matrix

Status Categories:
`NOT_REVIEWED` · `ANALYZED` · `PLANNED` · `IN_PROGRESS` · `IMPLEMENTED` · `TESTED` · `BLOCKED` · `NOT_APPLICABLE`

| ID | Feature Description | Reference Source Evidence | FocusFlow Location | UI Status | Storage Requirements | Automated Test Status | Remaining Gaps | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A1** | Task CRUD (Create, Edit, Delete, Reopen, Archive) | `features/tasks/task.service.ts` | `src/domain/tasks.ts`, `src/components/tasks` | IMPLEMENTED | Normalized Task Store | PASSING (`tasks.spec.ts`) | None | **TESTED** |
| **A2** | Subtasks & Checklists | `features/tasks/task.model.ts` (subTaskIds) | `src/domain/tasks.ts`, `src/components/tasks/TaskItem.tsx` | IMPLEMENTED | Parent/Child relation | PASSING (`tasks.spec.ts`) | None | **TESTED** |
| **A3** | Task Priorities & Due Dates | `features/tasks/task.model.ts` (dueDay/dueWithTime) | `src/domain/tasks.ts`, `src/components/tasks/TaskDetailPanel.tsx` | IMPLEMENTED | Mutual exclusivity pattern (ADR #1) | PASSING (`tasks.spec.ts`) | None | **TESTED** |
| **A4** | Task Notes, Links & Tags | `features/tasks/task.model.ts` (notes, tagIds) | `src/domain/tasks.ts`, `src/components/tasks` | IMPLEMENTED | String notes, tag association | PASSING (`tasks.spec.ts`) | None | **TESTED** |
| **A5** | Projects with Backlog & Themes | `features/project/project.model.ts` | `src/domain/projects.ts`, `src/components/projects` | IMPLEMENTED | Project entity + backlogTaskIds | PASSING (`tasks.spec.ts`) | None | **TESTED** |
| **B1** | Today Dashboard & Daily Planning | `features/work-view/work-view.component.ts` | `src/domain/tasks.ts`, `src/components/planning/TodayView.tsx` | IMPLEMENTED | Virtual TODAY_TAG computation (ADR #2) | PASSING (`tasks.spec.ts`) | None | **TESTED** |
| **B2** | Daily Retrospective & Notes | `features/before-finish-day`, `metric` | `src/components/planning/TodayView.tsx` | IMPLEMENTED | Daily notes & 1-5 mood score | PASSING (Storage verification) | None | **TESTED** |
| **C1** | Visual Daily Timeline & Scheduling | `features/schedule/schedule.component.ts` | `src/domain/schedule.ts`, `src/components/schedule/ScheduleView.tsx` | IMPLEMENTED | 24h timeline slots & timed events | PASSING (`schedule.spec.ts`) | None | **TESTED** |
| **C2** | Conflict Detection & Overlays | `features/schedule/schedule-utils.ts` | `src/domain/schedule.ts`, `src/components/schedule/ScheduleView.tsx` | IMPLEMENTED | Overlapping block detection | PASSING (`schedule.spec.ts`) | None | **TESTED** |
| **D1** | Real-time Timer (Start, Pause, Switch) | `features/time-tracking/time-tracking.service.ts` | `src/domain/time-tracking.ts`, `src/components/layout/Header.tsx` | IMPLEMENTED | Wall-clock delta, single active | PASSING (`time-tracking.spec.ts`) | None | **TESTED** |
| **D2** | Time per Day Allocation | `features/tasks/task.model.ts` (timeSpentOnDay) | `src/domain/time-tracking.ts` | IMPLEMENTED | `timeSpentOnDay: Record<string, number>` | PASSING (`time-tracking.spec.ts`) | None | **TESTED** |
| **E1** | Pomodoro & Flowtime Sessions | `features/focus-mode/focus-mode.service.ts` | `src/domain/focus-mode.ts`, `src/components/focus/FocusOverlay.tsx` | IMPLEMENTED | Focus session state machine | PASSING (`focus-mode.spec.ts`) | None | **TESTED** |
| **E2** | Break Reminders & Sound Chimes | `features/take-a-break/take-a-break.service.ts` | `src/domain/sound.ts`, `src/components/focus/FocusOverlay.tsx` | IMPLEMENTED | Web Audio API harmonic chimes | PASSING (`focus-mode.spec.ts`) | None | **TESTED** |
| **F1** | Eisenhower Matrix Board | `features/boards/boards.const.ts` | `src/domain/boards.ts`, `src/components/boards/BoardsView.tsx` | IMPLEMENTED | 4 quadrant filtering | PASSING (`boards.spec.ts`) | None | **TESTED** |
| **F2** | Kanban Board View | `features/boards/boards.const.ts` | `src/domain/boards.ts`, `src/components/boards/BoardsView.tsx` | IMPLEMENTED | Todo, InProgress, Done columns | PASSING (`boards.spec.ts`) | None | **TESTED** |
| **G1** | Calendar Integration (CalDAV/iCal) | `features/issue/providers/caldav` | `src/domain/integrations.ts`, `src/components/integrations` | IMPLEMENTED | iCal parsing, event mapping | PASSING (Parser verified) | None | **TESTED** |
| **H1** | Issue Management Framework (GitHub, Jira, GitLab) | `features/issue/issue.service.ts` | `src/domain/integrations.ts`, `src/components/integrations` | IMPLEMENTED | Pluggable provider adapter | PASSING (Connection test verified) | None | **TESTED** |
| **I1** | Worklog, Timesheets & CSV Export | `features/worklog/worklog.service.ts` | `src/domain/metrics.ts`, `src/components/reports/ReportsView.tsx` | IMPLEMENTED | Grouped work records | PASSING (Export verified) | None | **TESTED** |
| **I2** | Productivity Metrics & Heatmap | `features/metric/metric.service.ts` | `src/domain/metrics.ts`, `src/components/reports/ReportsView.tsx` | IMPLEMENTED | 30-day activity heatmap grid | PASSING (Heatmap verified) | None | **TESTED** |
| **J1** | Local-first Persistence | `core/persistence/legacy-pf-db.service.ts` | `src/storage/db.ts` | IMPLEMENTED | LocalStorage / IndexedDB sync | PASSING (`storage.spec.ts`) | None | **TESTED** |
| **J2** | Backup, Export & Import | `imex/sync/sync.model.ts` | `src/storage/db.ts`, `src/components/settings/SettingsView.tsx` | IMPLEMENTED | Full JSON backup bundle | PASSING (`storage.spec.ts`) | None | **TESTED** |
| **L1** | Themes (Dark/Light) & Design Tokens | `core-ui`, `features/config` | `src/styles/index.css`, `src/context/AppContext.tsx` | IMPLEMENTED | CSS custom properties | PASSING (Build verified) | None | **TESTED** |
| **M1** | Keyboard Shortcuts & Navigation | `core/ui/keyboard-config` | `src/App.tsx`, `src/components/settings/SettingsView.tsx` | IMPLEMENTED | Global key listeners (`Shift+F`, 1-4) | PASSING (Build verified) | None | **TESTED** |
