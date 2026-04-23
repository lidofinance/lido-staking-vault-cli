import { sleep } from './sleep.js';

const RATE_LIMIT_BATCH_SIZE = 120; // Max parallel requests per batch
const RATE_LIMIT_DELAY_MS = 500; // Delay between batches

/**
 * Execute async operations in batches with rate limiting
 * to respect API limits of 10-20 calls per second
 * @param items - Array of items to process
 * @param batchSize - Size of each batch
 * @param delayMs - Delay between batches
 * @param executor - Function to execute for each item
 * @returns Array of results
 */
export const executeBatchedWithRateLimit = async <T, R>(
  items: T[],
  executor: (item: T) => Promise<R>,
  batchSize = Math.max(
    1,
    process.env.RATE_LIMIT_BATCH_SIZE
      ? Number(process.env.RATE_LIMIT_BATCH_SIZE)
      : RATE_LIMIT_BATCH_SIZE,
  ),
  delayMs = Math.max(
    0,
    process.env.RATE_LIMIT_DELAY_MS
      ? Number(process.env.RATE_LIMIT_DELAY_MS)
      : RATE_LIMIT_DELAY_MS,
  ),
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(executor));
    results.push(...batchResults);

    // Add delay between batches (except for the last batch)
    if (i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }

  return results;
};

export class RateLimitedFetch {
  private minDelayMs: number;
  private pending: Promise<void> = Promise.resolve();

  constructor(minDelayMs: number = 1000) {
    this.minDelayMs = minDelayMs;
  }

  async fetch(url: string | URL, options?: RequestInit): Promise<Response> {
    const gate = this.pending;
    // eslint-disable-next-line unicorn/consistent-function-scoping
    let resolve: () => void = () => {};
    this.pending = new Promise<void>((_resolve) => (resolve = _resolve));

    await gate;
    try {
      return await fetch(url, options);
    } finally {
      setTimeout(resolve, this.minDelayMs);
    }
  }
}
