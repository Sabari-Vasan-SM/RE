import { describe, it, expect } from 'vitest';
import {
  createInitialFocusSession,
  startFocusSession,
  pauseFocusSession,
  tickFocusSession,
  skipBreak,
  resetFocusSession,
} from '../../src/domain/focus-mode';

describe('Focus Mode State Machine & Pomodoro Cycles', () => {
  it('initializes with default 25m work duration in IDLE phase', () => {
    const session = createInitialFocusSession();
    expect(session.phase).toBe('IDLE');
    expect(session.mode).toBe('POMODORO');
    expect(session.isRunning).toBe(false);
    expect(session.durationMs).toBe(25 * 60 * 1000);
    expect(session.elapsedMs).toBe(0);
    expect(session.completedPomodoros).toBe(0);
  });

  it('starts session and transitions to WORK phase', () => {
    let session = createInitialFocusSession();
    session = startFocusSession(session, 'task-xyz');
    expect(session.isRunning).toBe(true);
    expect(session.phase).toBe('WORK');
    expect(session.activeTaskId).toBe('task-xyz');
  });

  it('transitions to SHORT_BREAK after 1 completed Pomodoro cycle', () => {
    let session = createInitialFocusSession();
    session = startFocusSession(session, 'task-1');

    // Simulate ticking through the full 25 minutes
    const tickResult = tickFocusSession(session, 25 * 60 * 1000);
    expect(tickResult.completedPhase).toBe('WORK');
    expect(tickResult.session.phase).toBe('SHORT_BREAK');
    expect(tickResult.session.durationMs).toBe(5 * 60 * 1000);
    expect(tickResult.session.completedPomodoros).toBe(1);
    expect(tickResult.session.elapsedMs).toBe(0);
  });

  it('transitions to LONG_BREAK after cyclesBeforeLongBreak (4) Pomodoros', () => {
    let session = createInitialFocusSession();
    session.completedPomodoros = 3; // 3 already finished
    session = startFocusSession(session);

    // Finish 4th work session
    const tickResult = tickFocusSession(session, 25 * 60 * 1000);
    expect(tickResult.completedPhase).toBe('WORK');
    expect(tickResult.session.phase).toBe('LONG_BREAK');
    expect(tickResult.session.durationMs).toBe(15 * 60 * 1000);
    expect(tickResult.session.completedPomodoros).toBe(4);
  });

  it('allows skipping breaks to return to WORK immediately', () => {
    let session = createInitialFocusSession();
    session.phase = 'SHORT_BREAK';
    session.durationMs = 5 * 60 * 1000;
    session.elapsedMs = 100000;

    session = skipBreak(session);
    expect(session.phase).toBe('WORK');
    expect(session.durationMs).toBe(25 * 60 * 1000);
    expect(session.elapsedMs).toBe(0);
  });
});
