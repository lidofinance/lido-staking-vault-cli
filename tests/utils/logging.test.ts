import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('../../utils/logging/constants.js', () => ({
  getColoredLog: (_t: any, m: any) => m,
  TABLE_PARAMS: {},
}));
import { createConsole } from '../../utils/logging/console.js';

beforeEach(() => {
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
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
