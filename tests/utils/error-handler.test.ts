import { describe, test, expect, beforeEach, vi } from 'vitest';
import { program } from 'commander';
import type { Mock } from 'vitest';

import { logError } from '../../utils/logging/console.js';
import { printError } from '../../utils/error-handler.js';

vi.mock('commander', () => ({ program: { error: vi.fn() } }));
vi.mock('../../utils/logging/console.js', () => ({ logError: vi.fn() }));

let programError: Mock;
let logErrorMock: Mock;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  programError = program.error as unknown as Mock;
  logErrorMock = logError as Mock;
  vi.clearAllMocks();
});

describe('error handler', () => {
  test('handles error with message', () => {
    const error = new Error('test error');
    printError(error, 'test message');
    expect(programError).toHaveBeenCalledWith('test error', { exitCode: 1 });
    expect(logErrorMock).toHaveBeenCalledWith('test message');
  });

  test('handles error without message', () => {
    const error = new Error();
    printError(error, 'test message');
    expect(programError).toHaveBeenCalledWith('', { exitCode: 1 });
    expect(logErrorMock).toHaveBeenCalledWith('test message');
  });

  test('handles non-Error object', () => {
    const error = 'test error';
    printError(error, 'test message');
    expect(programError).toHaveBeenCalledWith('test error', { exitCode: 1 });
    expect(logErrorMock).toHaveBeenCalledWith('test message');
  });

  test('logs error details when debug is enabled', () => {
    process.env.DEBUG = 'true';
    const error = new Error('test error');
    printError(error, 'test message');
    expect(programError).toHaveBeenCalledWith('test error', { exitCode: 1 });
    expect(logErrorMock).toHaveBeenCalledWith('test message');
    delete process.env.DEBUG;
  });
});
