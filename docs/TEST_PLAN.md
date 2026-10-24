# FocusFlow — Quality Assurance & Automated Test Plan

## 1. Strategy & Verification Framework
FocusFlow utilizes **Vitest** for blazing-fast, strictly typed unit and integration tests. Every critical domain invariant identified during the Super Productivity reverse engineering must be covered by automated test suites.

---

## 2. Test Suite Matrix

### 2.1 Task & Project Domain Tests (`tests/unit/tasks.spec.ts`, `tests/unit/projects.spec.ts`)
- [ ] Task CRUD: creation, updating fields, completing, reopening, archiving, deleting.
- [ ] Mutual Exclusivity Pattern: Setting `dueWithTime` clears `dueDay`; setting `dueDay` clears `dueWithTime`.
- [ ] Invariant: `TODAY_TAG` is never persisted in `task.tagIds`.
- [ ] Subtask hierarchy: Completing all subtasks or cascading parent completion.
- [ ] Project backlog vs. active tasks ordering.

### 2.2 Time Tracking Engine Tests (`tests/unit/time-tracking.spec.ts`)
- [ ] Only one task can be active at a time; starting a new task stops the previous one.
- [ ] Wall-clock calculation accuracy across simulated time jumps.
- [ ] Accumulation of `timeSpent` and `timeSpentOnDay['YYYY-MM-DD']`.
- [ ] Handling midnight day-boundary rollover during an active session.

### 2.3 Focus Mode & Pomodoro State Machine (`tests/unit/focus-mode.spec.ts`)
- [ ] Pomodoro cycle transitions: Work (25m) -> Short Break (5m) -> Work (25m) -> Long Break (15m).
- [ ] Flowtime mode: open-ended work tracking, proportional break calculation.
- [ ] Countdown mode: decrements accurately down to zero.
- [ ] Skip, pause, reset, and resume state transitions.

### 2.4 Boards & Eisenhower Filtering (`tests/unit/boards.spec.ts`)
- [ ] Eisenhower Matrix 4-quadrant dynamic partition based on `URGENT` and `IMPORTANT` tags.
- [ ] Kanban column membership: To Do (undone, not in-progress), In Progress (`IN_PROGRESS_TAG`), Done (`isDone: true`).
- [ ] Reordering cards and moving across columns updating task status/tags.

### 2.5 Data Persistence & Backup Recovery (`tests/unit/storage.spec.ts`)
- [ ] Serialization of full `AppDataComplete` bundle to JSON.
- [ ] Importing valid JSON restoring full task, project, tag, and config state.
- [ ] Rejection and graceful error handling on corrupt or invalid JSON.

---

## 3. Execution Commands
```bash
npm run test         # Runs vitest suite
npm run test:coverage # Generates coverage report
npm run build        # Type checks and builds production bundle
```
