import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { program } from 'commander';

import { logError } from '../../utils/logging/console.js';
import { printError } from '../../utils/error-handler.js';

// Mock chalk module
jest.mock('chalk', () => ({
  red: { bold: jest.fn((str) => str) },
  blue: { bold: jest.fn((str) => str) },
  green: { bold: jest.fn((str) => str) },
  bold: jest.fn((str) => str),
  yellow: { bold: jest.fn((str) => str) },
}));

jest.mock('commander', () => ({ program: { error: jest.fn() } }));
jest.mock('../../utils/logging/console.js', () => ({ logError: jest.fn() }));

let programError: jest.Mock;
let logErrorMock: jest.Mock;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  programError = program.error as unknown as jest.Mock;
  logErrorMock = logError as unknown as jest.Mock;
  jest.clearAllMocks();
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
