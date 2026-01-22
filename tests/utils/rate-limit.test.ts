import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { executeBatchedWithRateLimit } from '../../utils/rate-limit.js';

describe('executeBatchedWithRateLimit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    delete process.env.RATE_LIMIT_BATCH_SIZE;
    delete process.env.RATE_LIMIT_DELAY_MS;
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  test('processes all items and returns results in order', async () => {
    const items = [1, 2, 3, 4, 5];
    const executor = vi.fn(async (item: number) => item * 2);

    const promise = executeBatchedWithRateLimit(items, executor, 2, 100);

    // Advance timers to complete all batches
    await vi.advanceTimersByTimeAsync(300);

    const results = await promise;

    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(executor).toHaveBeenCalledTimes(5);
  });

  test('processes items in batches of specified size', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const batchSize = 3;

    const executor = vi.fn(async (item: number) => {
      return item;
    });

    const promise = executeBatchedWithRateLimit(
      items,
      executor,
      batchSize,
      100,
    );

    // First batch (3 items) should be called immediately
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(3);

    // Second batch (3 items) after 100ms delay
    await vi.advanceTimersByTimeAsync(100);
    expect(executor).toHaveBeenCalledTimes(6);

    // Third batch (1 item) after another 100ms delay
    await vi.advanceTimersByTimeAsync(100);
    expect(executor).toHaveBeenCalledTimes(7);

    const results = await promise;
    expect(results).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test('adds delay between batches', async () => {
    const items = [1, 2, 3, 4];
    const batchSize = 2;
    const delayMs = 500;
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(
      items,
      executor,
      batchSize,
      delayMs,
    );

    // First batch
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(2);

    // Should not process second batch yet
    await vi.advanceTimersByTimeAsync(400);
    expect(executor).toHaveBeenCalledTimes(2);

    // Second batch after full delay
    await vi.advanceTimersByTimeAsync(100);
    expect(executor).toHaveBeenCalledTimes(4);

    await promise;
  });

  test('does not add delay after last batch', async () => {
    const items = [1, 2, 3];
    const batchSize = 2;
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(
      items,
      executor,
      batchSize,
      1000,
    );

    // First batch
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(2);

    // Second batch (last one)
    await vi.advanceTimersByTimeAsync(1000);
    expect(executor).toHaveBeenCalledTimes(3);

    // Should complete immediately without extra delay
    const results = await promise;
    expect(results).toEqual([1, 2, 3]);
  });

  test('handles empty array', async () => {
    const items: number[] = [];
    const executor = vi.fn(async (item: number) => item);

    const results = await executeBatchedWithRateLimit(items, executor, 2, 100);

    expect(results).toEqual([]);
    expect(executor).not.toHaveBeenCalled();
  });

  test('handles single item', async () => {
    const items = [42];
    const executor = vi.fn(async (item: number) => item * 2);

    const results = await executeBatchedWithRateLimit(items, executor, 5, 100);

    expect(results).toEqual([84]);
    expect(executor).toHaveBeenCalledTimes(1);
  });

  test('handles batch size larger than items array', async () => {
    const items = [1, 2, 3];
    const executor = vi.fn(async (item: number) => item);

    const results = await executeBatchedWithRateLimit(items, executor, 10, 100);

    expect(results).toEqual([1, 2, 3]);
    expect(executor).toHaveBeenCalledTimes(3);
  });

  test('processes items in parallel within each batch', async () => {
    const items = [1, 2, 3];
    const batchSize = 3;
    let activeCount = 0;
    let maxActiveCount = 0;

    const executor = vi.fn(async (item: number) => {
      activeCount++;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      await new Promise((resolve) => setTimeout(resolve, 10));
      activeCount--;
      return item;
    });

    const promise = executeBatchedWithRateLimit(
      items,
      executor,
      batchSize,
      100,
    );

    await vi.advanceTimersByTimeAsync(50);

    const results = await promise;

    expect(results).toEqual([1, 2, 3]);
    // All 3 items in the batch should have been active simultaneously
    expect(maxActiveCount).toBe(3);
  });

  test('handles executor errors', async () => {
    const items = [1, 2, 3];
    const executor = vi.fn(async (item: number) => {
      if (item === 2) {
        throw new Error('Test error');
      }
      return item;
    });

    const promise = executeBatchedWithRateLimit(items, executor, 2, 100).catch(
      (error) => error,
    );

    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Test error');
  });

  test('preserves executor context and arguments', async () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ];

    const executor = vi.fn(async (item: { id: number; name: string }) => {
      return `${item.id}: ${item.name}`;
    });

    const promise = executeBatchedWithRateLimit(items, executor, 2, 100);

    await vi.advanceTimersByTimeAsync(200);

    const results = await promise;

    expect(results).toEqual(['1: Alice', '2: Bob', '3: Charlie']);
    expect(executor).toHaveBeenCalledTimes(3);

    // Check that each item was passed correctly to executor
    const calls = executor.mock.calls;
    expect(calls[0]?.[0]).toEqual({ id: 1, name: 'Alice' });
    expect(calls[1]?.[0]).toEqual({ id: 2, name: 'Bob' });
    expect(calls[2]?.[0]).toEqual({ id: 3, name: 'Charlie' });
  });

  test('respects rate limit with large dataset', async () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);
    const batchSize = 5;
    const delayMs = 1000;
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(
      items,
      executor,
      batchSize,
      delayMs,
    );

    // Batch 1: items 1-5 (t=0)
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(5);

    // Batch 2: items 6-10 (t=1000)
    await vi.advanceTimersByTimeAsync(1000);
    expect(executor).toHaveBeenCalledTimes(10);

    // Batch 3: items 11-15 (t=2000)
    await vi.advanceTimersByTimeAsync(1000);
    expect(executor).toHaveBeenCalledTimes(15);

    // Batch 4: items 16-20 (t=3000)
    await vi.advanceTimersByTimeAsync(1000);
    expect(executor).toHaveBeenCalledTimes(20);

    // Batch 5: items 21-25 (t=4000, last batch - no delay after)
    await vi.advanceTimersByTimeAsync(1000);
    expect(executor).toHaveBeenCalledTimes(25);

    const results = await promise;
    expect(results).toEqual(items);
  });

  test('handles different types correctly', async () => {
    const items = ['a', 'b', 'c'];
    const executor = vi.fn(async (item: string) => item.toUpperCase());

    const promise = executeBatchedWithRateLimit(items, executor, 2, 100);

    await vi.advanceTimersByTimeAsync(200);

    const results = await promise;

    expect(results).toEqual(['A', 'B', 'C']);
  });

  test('uses default batch size and delay when not specified', async () => {
    const items = Array.from({ length: 250 }, (_, i) => i + 1);
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor);

    // Default batch size is 120, so first batch should process 120 items
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(120);

    // Default delay is 500ms, second batch should process after delay
    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(240);

    // Last batch (10 items)
    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(250);

    const results = await promise;
    expect(results).toEqual(items);
  });

  test('uses environment variable for batch size', async () => {
    process.env.RATE_LIMIT_BATCH_SIZE = '10';

    const items = Array.from({ length: 25 }, (_, i) => i + 1);
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor);

    // Should use batch size of 10 from env var
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(10);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(20);

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(25);

    const results = await promise;
    expect(results).toEqual(items);
  });

  test('uses environment variable for delay', async () => {
    process.env.RATE_LIMIT_DELAY_MS = '1500';

    const items = [1, 2, 3, 4];
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor, 2);

    // First batch
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(2);

    // Should use delay of 1500ms from env var
    await vi.advanceTimersByTimeAsync(1000);
    expect(executor).toHaveBeenCalledTimes(2); // Still waiting

    await vi.advanceTimersByTimeAsync(500);
    expect(executor).toHaveBeenCalledTimes(4); // Second batch completed

    const results = await promise;
    expect(results).toEqual([1, 2, 3, 4]);
  });

  test('explicit parameters override environment variables', async () => {
    process.env.RATE_LIMIT_BATCH_SIZE = '10';
    process.env.RATE_LIMIT_DELAY_MS = '1000';

    const items = [1, 2, 3, 4, 5, 6];
    const executor = vi.fn(async (item: number) => item);

    const promise = executeBatchedWithRateLimit(items, executor, 3, 200);

    // Should use explicit batch size of 3, not env var of 10
    await vi.advanceTimersByTimeAsync(0);
    expect(executor).toHaveBeenCalledTimes(3);

    // Should use explicit delay of 200ms, not env var of 1000ms
    await vi.advanceTimersByTimeAsync(200);
    expect(executor).toHaveBeenCalledTimes(6);

    const results = await promise;
    expect(results).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
