import { describe, test, expect, vi } from 'vitest';
import { withInterruptHandling } from '../../utils/interrupt-handler.js';

describe('withInterruptHandling', () => {
  test('runs action and cleans up', async () => {
    const action = vi.fn(async () => 1);
    const wrapped = withInterruptHandling(action);
    const res = await wrapped();
    expect(res).toBe(1);
    expect(action).toHaveBeenCalled();
  });
});
