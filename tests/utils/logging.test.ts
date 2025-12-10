import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createConsole } from '../../utils/logging/console.js';

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('createConsole', () => {
  test('logs info', () => {
    const log = createConsole('LOG');
    log('hello');
    expect(console.info).toHaveBeenCalled();
  });

  test('logs error', () => {
    const err = createConsole('Error', 'error');
    err('oops');
    expect(console.error).toHaveBeenCalled();
  });
});
