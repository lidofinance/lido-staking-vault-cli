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
  batchSize = process.env.RATE_LIMIT_BATCH_SIZE
    ? Number(process.env.RATE_LIMIT_BATCH_SIZE)
    : RATE_LIMIT_BATCH_SIZE,
  delayMs = process.env.RATE_LIMIT_DELAY_MS
    ? Number(process.env.RATE_LIMIT_DELAY_MS)
    : RATE_LIMIT_DELAY_MS,
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
