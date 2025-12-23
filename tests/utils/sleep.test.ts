import { describe, test, expect, vi } from 'vitest';

import { sleep } from '../../utils/sleep.js';

describe('sleep', () => {
  test('waits specified time', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const p = sleep(500).then(spy);
    vi.advanceTimersByTime(500);
    await p;
    expect(spy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
