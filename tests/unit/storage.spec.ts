import { describe, it, expect } from 'vitest';
import {
  createDefaultState,
  exportBackupJSON,
  importBackupJSON,
} from '../../src/storage/db';

describe('Storage, Backup & Recovery Engine', () => {
  it('creates valid initial default state', () => {
    const state = createDefaultState();
    expect(state.version).toBe(1);
    expect(Object.keys(state.tasks).length).toBeGreaterThan(0);
    expect(Object.keys(state.projects).length).toBeGreaterThan(0);
    expect(Object.keys(state.tags).length).toBeGreaterThan(0);
  });

  it('exports and re-imports backup cleanly with full integrity', () => {
    const state = createDefaultState();
    const jsonStr = exportBackupJSON(state);
    expect(typeof jsonStr).toBe('string');

    const restored = importBackupJSON(jsonStr);
    expect(restored.version).toBe(state.version);
    expect(Object.keys(restored.tasks).length).toBe(Object.keys(state.tasks).length);
    expect(Object.keys(restored.projects).length).toBe(Object.keys(state.projects).length);
  });

  it('rejects malformed or corrupt backup JSON', () => {
    expect(() => importBackupJSON('not json')).toThrow();
    expect(() => importBackupJSON('{"someOther": 123}')).toThrow(/Invalid FocusFlow backup format/);
  });
});
