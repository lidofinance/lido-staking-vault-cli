import { sleep } from './sleep.js';
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
  batchSize: number,
  delayMs: number,
  executor: (item: T) => Promise<R>,
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
