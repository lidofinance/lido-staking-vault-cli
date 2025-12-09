import fs from 'fs/promises';
import path from 'path';

import { calculateShareRate, calculateRebaseReward } from 'utils';
import { logInfo } from './logging/index.js';

// Types for cached events
export type CachedTransferEvent = {
  blockNumber: string;
  from: string;
  to: string;
  value: string;
};

export type CachedSharesEvent = {
  blockNumber: string;
  account: string;
  stethShares: string;
};

export type CachedEvents = {
  transfer: CachedTransferEvent[];
  minted: CachedSharesEvent[];
  burned: CachedSharesEvent[];
};

const getShareRateCacheFile = () =>
  path.resolve('cache', `share-rate-cache-global.json`);
const getRebaseRewardCacheFile = (vaultAddress: string) =>
  path.resolve('cache', `rebase-rewards-cache-${vaultAddress}.json`);
const getNodeOperatorFeeRateCacheFile = (vaultAddress: string) =>
  path.resolve('cache', `node-operator-fee-rate-cache-${vaultAddress}.json`);
const getSettledGrowthCacheFile = (vaultAddress: string) =>
  path.resolve('cache', `settled-growth-cache-${vaultAddress}.json`);
const getIndexedEventsCacheFile = (poolAddress: string) =>
  path.resolve('cache', `indexed-events-cache-${poolAddress}.json`);

export const cache = {
  async getShareRate(blockNumber: number): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(getShareRateCacheFile(), 'utf-8'),
      );
      if (data[blockNumber] !== undefined) return BigInt(data[blockNumber]);
    } catch {
      /* ignore */
    }
    return null;
  },

  async setShareRate(blockNumber: number, value: bigint) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(await fs.readFile(getShareRateCacheFile(), 'utf-8'));
    } catch {
      /* ignore */
    }
    data[blockNumber] = value.toString();
    await fs.mkdir(path.dirname(getShareRateCacheFile()), {
      recursive: true,
    });
    await fs.writeFile(getShareRateCacheFile(), JSON.stringify(data), 'utf-8');
  },

  async getRebaseReward(
    vaultAddress: string,
    cacheKey: string,
  ): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(getRebaseRewardCacheFile(vaultAddress), 'utf-8'),
      );
      if (data[cacheKey] !== undefined) return BigInt(data[cacheKey]);
    } catch {
      /* ignore */
    }
    return null;
  },

  async setRebaseReward(vaultAddress: string, cacheKey: string, value: bigint) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(
        await fs.readFile(getRebaseRewardCacheFile(vaultAddress), 'utf-8'),
      );
    } catch {
      /* ignore */
    }
    data[cacheKey] = value.toString();
    await fs.mkdir(path.dirname(getRebaseRewardCacheFile(vaultAddress)), {
      recursive: true,
    });
    await fs.writeFile(
      getRebaseRewardCacheFile(vaultAddress),
      JSON.stringify(data),
      'utf-8',
    );
  },

  async getNodeOperatorFeeRate(
    vaultAddress: string,
    blockNumber: number,
  ): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(
          getNodeOperatorFeeRateCacheFile(vaultAddress),
          'utf-8',
        ),
      );
      if (data[blockNumber] !== undefined) return BigInt(data[blockNumber]);
    } catch {
      /* ignore */
    }
    return null;
  },

  async setNodeOperatorFeeRate(
    vaultAddress: string,
    blockNumber: number,
    value: bigint,
  ) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(
        await fs.readFile(
          getNodeOperatorFeeRateCacheFile(vaultAddress),
          'utf-8',
        ),
      );
    } catch {
      /* ignore */
    }
    data[blockNumber] = value.toString();
    await fs.mkdir(
      path.dirname(getNodeOperatorFeeRateCacheFile(vaultAddress)),
      {
        recursive: true,
      },
    );
    await fs.writeFile(
      getNodeOperatorFeeRateCacheFile(vaultAddress),
      JSON.stringify(data),
      'utf-8',
    );
  },

  async getSettledGrowth(
    vaultAddress: string,
    blockNumber: number,
  ): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(getSettledGrowthCacheFile(vaultAddress), 'utf-8'),
      );
      if (data[blockNumber] !== undefined) return BigInt(data[blockNumber]);
    } catch {
      /* ignore */
    }
    return null;
  },

  async setSettledGrowth(
    vaultAddress: string,
    blockNumber: number,
    value: bigint,
  ) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(
        await fs.readFile(getSettledGrowthCacheFile(vaultAddress), 'utf-8'),
      );
    } catch {
      /* ignore */
    }
    data[blockNumber] = value.toString();
    await fs.mkdir(path.dirname(getSettledGrowthCacheFile(vaultAddress)), {
      recursive: true,
    });
    await fs.writeFile(
      getSettledGrowthCacheFile(vaultAddress),
      JSON.stringify(data),
      'utf-8',
    );
  },

  async getIndexedEventsByBlock(
    poolAddress: string,
    blockNumber: bigint,
  ): Promise<CachedEvents | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(getIndexedEventsCacheFile(poolAddress), 'utf-8'),
      );
      const key = blockNumber.toString();
      if (data[key] !== undefined) return data[key];
    } catch {
      /* ignore */
    }
    return null;
  },

  async getAllIndexedEvents(
    poolAddress: string,
  ): Promise<Record<string, CachedEvents>> {
    try {
      const data = JSON.parse(
        await fs.readFile(getIndexedEventsCacheFile(poolAddress), 'utf-8'),
      );
      return data;
    } catch {
      /* ignore */
    }
    return {};
  },

  async setIndexedEventsForBlocks(
    poolAddress: string,
    eventsMap: Map<bigint, CachedEvents>,
  ) {
    let data: Record<string, CachedEvents> = {};
    try {
      data = JSON.parse(
        await fs.readFile(getIndexedEventsCacheFile(poolAddress), 'utf-8'),
      );
    } catch {
      /* ignore */
    }

    // Add all new block data
    for (const [blockNumber, events] of eventsMap.entries()) {
      data[blockNumber.toString()] = events;
    }

    await fs.mkdir(path.dirname(getIndexedEventsCacheFile(poolAddress)), {
      recursive: true,
    });
    await fs.writeFile(
      getIndexedEventsCacheFile(poolAddress),
      JSON.stringify(data),
      'utf-8',
    );
  },
};

export const getShareRateFromCache = async (
  blockNumber: number,
): Promise<bigint> => {
  const cached = await cache.getShareRate(blockNumber);
  if (cached !== null) return cached;
  const shareRate = await calculateShareRate(blockNumber);

  await cache.setShareRate(blockNumber, shareRate);

  return shareRate;
};

type GetRebaseRewardFromCacheArgs = {
  vaultAddress: string;
  blockNumberPrev: number;
  blockNumberCurr: number;
  liabilitySharesPrev: bigint;
  liabilitySharesCurr: bigint;
};

export const getRebaseRewardFromCache = async (
  args: GetRebaseRewardFromCacheArgs,
): Promise<bigint> => {
  const {
    vaultAddress,
    blockNumberPrev,
    blockNumberCurr,
    liabilitySharesPrev,
    liabilitySharesCurr,
  } = args;

  const cacheKey = `${blockNumberPrev}_${blockNumberCurr}`;
  const cached = await cache.getRebaseReward(vaultAddress, cacheKey);
  if (cached !== null) return cached;

  const shareRatePrev = await getShareRateFromCache(blockNumberPrev);
  const shareRateCurr = await getShareRateFromCache(blockNumberCurr);

  const reward = calculateRebaseReward({
    shareRatePrev,
    shareRateCurr,
    sharesPrev: liabilitySharesPrev,
    sharesCurr: liabilitySharesCurr,
  });

  await cache.setRebaseReward(vaultAddress, cacheKey, reward);
  return reward;
};

type GetIndexedEventsFromCacheArgs = {
  poolAddress: string;
  startBlock: bigint;
  endBlock: bigint;
  fetchEventsForBlocks: (
    blocks: bigint[],
  ) => Promise<Map<bigint, CachedEvents>>;
};

export const getIndexedEventsFromCache = async (
  args: GetIndexedEventsFromCacheArgs,
): Promise<CachedEvents> => {
  const { poolAddress, startBlock, endBlock, fetchEventsForBlocks } = args;

  const allEvents: CachedEvents = {
    transfer: [],
    minted: [],
    burned: [],
  };

  const blocksToFetch: bigint[] = [];
  const totalBlocks = Number(endBlock - startBlock + 1n);

  // Read cache file once
  const cachedData = await cache.getAllIndexedEvents(poolAddress);
  const cachedBlocksCount = Object.keys(cachedData).length;

  logInfo(
    `Cache contains ${cachedBlocksCount} blocks, checking range ${startBlock}-${endBlock} (${totalBlocks} blocks)...`,
  );

  // Check each block in range
  for (let block = startBlock; block <= endBlock; block++) {
    const blockKey = block.toString();
    const cached = cachedData[blockKey];

    if (cached !== undefined) {
      // Block is cached, add events to result
      allEvents.transfer.push(...cached.transfer);
      allEvents.minted.push(...cached.minted);
      allEvents.burned.push(...cached.burned);
    } else {
      // Block is not cached, need to fetch
      blocksToFetch.push(block);
    }
  }

  const cachedInRange = totalBlocks - blocksToFetch.length;
  logInfo(
    `Found ${cachedInRange}/${totalBlocks} blocks in cache, need to fetch ${blocksToFetch.length} blocks`,
  );

  // Fetch missing blocks (batching logic is in fetchEventsForBlocks)
  if (blocksToFetch.length > 0) {
    const newEventsMap = await fetchEventsForBlocks(blocksToFetch);

    // Add new events to result
    for (const [, events] of newEventsMap.entries()) {
      allEvents.transfer.push(...events.transfer);
      allEvents.minted.push(...events.minted);
      allEvents.burned.push(...events.burned);
    }

    // Save all new blocks to cache
    await cache.setIndexedEventsForBlocks(poolAddress, newEventsMap);
  }

  return allEvents;
};
