# FocusFlow — System Architecture & Design Specification

## 1. Architectural Philosophy
FocusFlow is engineered as a **local-first, reactive, modular productivity suite**. It rejects heavy framework overhead in favor of a lean, high-velocity, strictly typed TypeScript stack with zero telemetry, high privacy, instant startup, and deterministic state transitions.

### Key Tenets
1. **Local-First & Offline-Ready**: All data operations write synchronously to the state layer and are automatically persisted to IndexedDB with LocalStorage fallbacks.
2. **Deterministic Time Tracking**: Never rely solely on `setInterval` ticks for wall-clock tracking; derive elapsed time from timestamps (`Date.now() - sessionStart`).
3. **Clean Domain Separation**: Business rules (e.g. mutual exclusivity of scheduling dates, Pomodoro cycle progression, task hierarchy updates) are isolated from UI components in dedicated domain services.
4. **Rich Aesthetics & Polish**: Thoughtful typography (Inter, Outfit), high-contrast accessibility, dark and light modes, smooth transitions, and distinct product identity without generic templates.

---

## 2. Layered Architecture

```mermaid
graph TD
    A[FocusFlow UI Views: Today, Projects, Boards, Timeline, Focus, Reports, Settings] --> B[Domain Services & State Store]
    B --> C1[Task & Project Domain Service]
    B --> C2[Time Tracking & Pomodoro State Machine]
    B --> C3[Scheduling & Timeline Engine]
    B --> C4[Metrics & Worklog Aggregator]
    B --> C5[Integration Hub: GitHub, Jira, CalDAV]
    C1 --> D[Storage & Persistence Engine]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    D --> E1[(IndexedDB / LocalStorage)]
    D --> E2[JSON Backup & Recovery Manager]
```

---

## 3. Core Subsystems

### 3.1 Domain Services & Store
- **Task Store**: Normalized dictionary of tasks, tags, projects, subtasks, and archive.
- **Time Tracking Service**: Manages active task timer, day-based log entries, and session boundaries.
- **Focus Mode Engine**: State machine for Pomodoro, Flowtime, and Countdown modes with break triggers.
- **Board Engine**: Categorizes tasks dynamically into Kanban and Eisenhower Matrix views.
- **Schedule Engine**: Maps tasks with `dueWithTime` and planned durations onto a 24-hour visual schedule grid.
- **Integrations Engine**: Manages external issue synchronization protocols with token isolation.

### 3.2 Storage & Backup Layer
- Handles auto-saving state with debounce.
- Full backup export/import conforming to the validated JSON schema.
- Built-in schema validation and fallback recovery.
