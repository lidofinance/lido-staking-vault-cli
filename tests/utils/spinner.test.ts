import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// vi.hoisted ensures mocks are created before vi.mock hoisting
const mocks = vi.hoisted(() => {
  const clear = vi.fn();
  const logUpdateStderr = Object.assign(vi.fn(), { clear });
  const logUpdateDefault = vi.fn();
  return { logUpdateStderr, logUpdateDefault, clear };
});

vi.mock('log-update', () => ({
  logUpdateStderr: mocks.logUpdateStderr,
  default: mocks.logUpdateDefault,
}));

import { showSpinner } from '../../utils/spinner/spinners.js';

const originalArgv = process.argv;

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  process.argv = [...originalArgv].filter((a) => a !== '--json');
});

afterEach(() => {
  vi.useRealTimers();
  process.argv = originalArgv;
});

describe('showSpinner — --json mode', () => {
  beforeEach(() => {
    process.argv = [...process.argv, '--json'];
  });

  test('returns a no-op function without starting an interval', () => {
    const hide = showSpinner();

    vi.advanceTimersByTime(2000);

    expect(mocks.logUpdateStderr).not.toHaveBeenCalled();
    expect(typeof hide).toBe('function');
  });

  test('logUpdate (stdout) is also not called', () => {
    showSpinner();
    vi.advanceTimersByTime(2000);
    expect(mocks.logUpdateDefault).not.toHaveBeenCalled();
  });

  test('the returned cleanup function does not throw', () => {
    const hide = showSpinner();
    expect(() => hide()).not.toThrow();
  });

  test('stdout.write is not called', () => {
    const writeSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    showSpinner();
    vi.advanceTimersByTime(2000);
    expect(writeSpy).not.toHaveBeenCalled();
  });
});

describe('showSpinner — normal mode (without --json)', () => {
  test('writes spinner frames to stderr via logUpdateStderr', () => {
    showSpinner({ type: 'point', message: 'Loading...' });

    // point interval = 125ms; advance 200ms → at least 1 call
    vi.advanceTimersByTime(200);

    expect(mocks.logUpdateStderr).toHaveBeenCalled();
    const frame = mocks.logUpdateStderr.mock.calls[0]?.[0] as string;
    expect(frame).toContain('Loading...');
  });

  test('does NOT use logUpdate (stdout)', () => {
    showSpinner();
    vi.advanceTimersByTime(500);
    expect(mocks.logUpdateDefault).not.toHaveBeenCalled();
  });

  test('defaults to type point and message "Executing..."', () => {
    showSpinner();
    vi.advanceTimersByTime(200);

    const frame = mocks.logUpdateStderr.mock.calls[0]?.[0] as string;
    expect(frame).toContain('Executing...');
  });

  test('frames change over time', () => {
    showSpinner({ type: 'point' });

    vi.advanceTimersByTime(125);
    const first = mocks.logUpdateStderr.mock.calls[0]?.[0] as string;

    vi.advanceTimersByTime(125);
    const second = mocks.logUpdateStderr.mock.calls[1]?.[0] as string;

    // frames should differ (animation)
    expect(first).not.toBe(second);
  });

  test('cleanup stops the interval and calls logUpdateStderr.clear()', () => {
    const hide = showSpinner();

    vi.advanceTimersByTime(200);
    const callsBefore = mocks.logUpdateStderr.mock.calls.length;

    hide();

    // no new calls should happen after hiding
    vi.advanceTimersByTime(500);
    expect(mocks.logUpdateStderr.mock.calls.length).toBe(callsBefore);
    expect(mocks.clear).toHaveBeenCalledOnce();
  });

  test('supports a custom spinner type and message', () => {
    showSpinner({ type: 'line', message: 'Processing...' });
    vi.advanceTimersByTime(200);

    const frame = mocks.logUpdateStderr.mock.calls[0]?.[0] as string;
    expect(frame).toContain('Processing...');
  });

  test('multiple independent spinners do not interfere with each other', () => {
    const hide1 = showSpinner({ message: 'Task 1' });
    const hide2 = showSpinner({ message: 'Task 2' });

    vi.advanceTimersByTime(200);
    expect(mocks.logUpdateStderr.mock.calls.length).toBeGreaterThanOrEqual(2);

    const callsAfterBoth = mocks.logUpdateStderr.mock.calls.length;
    hide1();

    vi.advanceTimersByTime(200);
    // second spinner keeps writing
    expect(mocks.logUpdateStderr.mock.calls.length).toBeGreaterThan(
      callsAfterBoth,
    );

    hide2();
    const callsAfterAll = mocks.logUpdateStderr.mock.calls.length;
    vi.advanceTimersByTime(500);
    expect(mocks.logUpdateStderr.mock.calls.length).toBe(callsAfterAll);
  });
});
