import { FocusSessionState, FocusConfig, FocusMode, FocusPhase } from '../types';

export const DEFAULT_FOCUS_CONFIG: FocusConfig = {
  workDurationMs: 25 * 60 * 1000,
  shortBreakDurationMs: 5 * 60 * 1000,
  longBreakDurationMs: 15 * 60 * 1000,
  cyclesBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartWork: false,
  soundEnabled: true,
};

export function createInitialFocusSession(config: FocusConfig = DEFAULT_FOCUS_CONFIG): FocusSessionState {
  return {
    mode: 'POMODORO',
    phase: 'IDLE',
    isRunning: false,
    activeTaskId: null,
    sessionStart: null,
    durationMs: config.workDurationMs,
    elapsedMs: 0,
    completedPomodoros: 0,
    config,
  };
}

export function startFocusSession(
  session: FocusSessionState,
  taskId?: string | null,
  now: number = Date.now()
): FocusSessionState {
  const initialDuration =
    session.phase === 'SHORT_BREAK'
      ? session.config.shortBreakDurationMs
      : session.phase === 'LONG_BREAK'
      ? session.config.longBreakDurationMs
      : session.mode === 'COUNTDOWN'
      ? session.durationMs || 45 * 60 * 1000
      : session.config.workDurationMs;

  return {
    ...session,
    isRunning: true,
    phase: session.phase === 'IDLE' ? 'WORK' : session.phase,
    activeTaskId: taskId !== undefined ? taskId : session.activeTaskId,
    sessionStart: now,
    durationMs: initialDuration,
  };
}

export function pauseFocusSession(session: FocusSessionState): FocusSessionState {
  return {
    ...session,
    isRunning: false,
    sessionStart: null,
  };
}

export function tickFocusSession(
  session: FocusSessionState,
  deltaMs: number
): { session: FocusSessionState; completedPhase: FocusPhase | null } {
  if (!session.isRunning || deltaMs <= 0) {
    return { session, completedPhase: null };
  }

  const newElapsed = session.elapsedMs + deltaMs;

  // In Flowtime mode, timer counts up indefinitely
  if (session.mode === 'FLOWTIME') {
    return {
      session: {
        ...session,
        elapsedMs: newElapsed,
      },
      completedPhase: null,
    };
  }

  // Pomodoro / Countdown countdown checks
  if (newElapsed >= session.durationMs) {
    const finishedPhase = session.phase;

    if (finishedPhase === 'WORK') {
      const newCompleted = session.completedPomodoros + 1;
      const isLongBreak = newCompleted % session.config.cyclesBeforeLongBreak === 0;
      const nextPhase: FocusPhase = isLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';
      const nextDuration = isLongBreak
        ? session.config.longBreakDurationMs
        : session.config.shortBreakDurationMs;

      return {
        session: {
          ...session,
          phase: nextPhase,
          durationMs: nextDuration,
          elapsedMs: 0,
          completedPomodoros: newCompleted,
          isRunning: session.config.autoStartBreaks,
        },
        completedPhase: 'WORK',
      };
    } else {
      // Break has finished -> Transition to Work
      return {
        session: {
          ...session,
          phase: 'WORK',
          durationMs: session.config.workDurationMs,
          elapsedMs: 0,
          isRunning: session.config.autoStartWork,
        },
        completedPhase: finishedPhase,
      };
    }
  }

  return {
    session: {
      ...session,
      elapsedMs: newElapsed,
    },
    completedPhase: null,
  };
}

export function skipBreak(session: FocusSessionState): FocusSessionState {
  return {
    ...session,
    phase: 'WORK',
    durationMs: session.config.workDurationMs,
    elapsedMs: 0,
    isRunning: false,
  };
}

export function resetFocusSession(session: FocusSessionState): FocusSessionState {
  return {
    ...session,
    isRunning: false,
    phase: 'IDLE',
    elapsedMs: 0,
    sessionStart: null,
    durationMs: session.config.workDurationMs,
  };
}
