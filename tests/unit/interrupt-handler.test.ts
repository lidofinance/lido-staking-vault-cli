import { describe, test, expect, jest } from '@jest/globals';
jest.mock('../../utils/logging/constants.js', () => ({
  getColoredLog: (_t: any, m: any) => m,
}));
import { withInterruptHandling } from '../../utils/interrupt-handler.js';

describe('withInterruptHandling', () => {
  test('runs action and cleans up', async () => {
    const action = jest.fn(async () => 1);
    const wrapped = withInterruptHandling(action);
    const res = await wrapped();
    expect(res).toBe(1);
    expect(action).toHaveBeenCalled();
  });
});
