import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeBatchedWithRateLimit } from '../../utils/rate-limit.js';

describe('rate-limit batch size clamping (L4)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    process.env = { ...originalEnv };
    delete process.env.RATE_LIMIT_BATCH_SIZE;
    delete process.env.RATE_LIMIT_DELAY_MS;
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  test('clamps env batch size to minimum 1 when set to 0', async () => {
    process.env.RATE_LIMIT_BATCH_SIZE = '0';
    const items = [1, 2, 3];
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor);

    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(3);

    const results = await promise;
    expect(results).toEqual([1, 2, 3]);
  });

  test('clamps env batch size to minimum 1 when negative', async () => {
    process.env.RATE_LIMIT_BATCH_SIZE = '-5';
    const items = [1, 2];
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor);

    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(2);

    const results = await promise;
    expect(results).toEqual([1, 2]);
  });

  test('clamps env delay to minimum 0 when negative', async () => {
    process.env.RATE_LIMIT_DELAY_MS = '-100';
    const items = [1, 2, 3, 4];
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor, 2);

    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(4);

    const results = await promise;
    expect(results).toEqual([1, 2, 3, 4]);
  });

  test('falls back to default when env batch size is NaN', async () => {
    process.env.RATE_LIMIT_BATCH_SIZE = 'abc';
    const items = Array.from({ length: 250 }, (_, i) => i + 1);
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor);

    // Should use default batch size (120), not NaN
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(120);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(240);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(250);

    const results = await promise;
    expect(results).toEqual(items);
  });

  test('falls back to default when env delay is NaN', async () => {
    process.env.RATE_LIMIT_DELAY_MS = 'xyz';
    const items = [1, 2, 3, 4];
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor, 2);

    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(2);

    // Should use default delay (500ms), not NaN
    await vi.advanceTimersByTimeAsync(400);
    expect(executor).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(100);
    expect(executor).toHaveBeenCalledTimes(4);

    const results = await promise;
    expect(results).toEqual([1, 2, 3, 4]);
  });
});
