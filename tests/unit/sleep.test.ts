import { describe, test, expect, jest } from '@jest/globals';

import { sleep } from '../../utils/sleep.js';

describe('sleep', () => {
  test('waits specified time', async () => {
    jest.useFakeTimers();
    const spy = jest.fn();
    const p = sleep(500).then(spy);
    jest.advanceTimersByTime(500);
    await p;
    expect(spy).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
