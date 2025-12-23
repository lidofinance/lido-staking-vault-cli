import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

import { logError } from '../../utils/logging/console.js';
import { printError } from '../../utils/error-handler.js';

vi.mock('../../utils/logging/console.js', () => ({ logError: vi.fn() }));

let logErrorMock: Mock;

beforeEach(() => {
  logErrorMock = logError as Mock;
  vi.clearAllMocks();
});

describe('error handler', () => {
  test('handles error with message', () => {
    const error = new Error('test error');
    expect(() => printError(error, 'test message')).toThrow('test error');
    expect(logErrorMock).toHaveBeenCalledWith('test message');
  });

  test('handles error without message', () => {
    const error = new Error();
    expect(() => printError(error, 'test message')).toThrow();
    expect(logErrorMock).toHaveBeenCalledWith('test message');
  });

  test('handles non-Error object', () => {
    const error = 'test error';
    expect(() => printError(error, 'test message')).toThrow();
    expect(logErrorMock).toHaveBeenCalledWith('test message');
  });

  test('logs error details when debug is enabled', () => {
    process.env.DEBUG = 'true';
    const error = new Error('test error');
    expect(() => printError(error, 'test message')).toThrow('test error');
    expect(logErrorMock).toHaveBeenCalledWith('test message');
    delete process.env.DEBUG;
  });
});
