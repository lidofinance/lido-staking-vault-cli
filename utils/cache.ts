import fs from 'fs/promises';
import path from 'path';

import { calculateShareRate, calculateRebaseReward } from 'utils';
import { logInfo } from './logging/index.js';
import { Address } from 'viem';

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
const getNodeOperatorAccruedFeeCacheFile = (vaultAddress: string) =>
  path.resolve('cache', `node-operator-accrued-fee-cache-${vaultAddress}.json`);

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

  async getNodeOperatorAccruedFee(
    vaultAddress: string,
    blockNumber: number,
  ): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(
          getNodeOperatorAccruedFeeCacheFile(vaultAddress),
          'utf-8',
        ),
      );
      if (data[blockNumber] !== undefined) return BigInt(data[blockNumber]);
    } catch {
      /* ignore */
    }
    return null;
  },

  async setNodeOperatorAccruedFee(
    vaultAddress: string,
    blockNumber: number,
    value: bigint,
  ) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(
        await fs.readFile(
          getNodeOperatorAccruedFeeCacheFile(vaultAddress),
          'utf-8',
        ),
      );
    } catch {
      /* ignore */
    }
    data[blockNumber] = value.toString();
    await fs.mkdir(
      path.dirname(getNodeOperatorAccruedFeeCacheFile(vaultAddress)),
      {
        recursive: true,
      },
    );
    await fs.writeFile(
      getNodeOperatorAccruedFeeCacheFile(vaultAddress),
      JSON.stringify(data),
      'utf-8',
    );
  },

  async getIndexedEventsByBlock(
    cacheKey: string,
    blockNumber: bigint,
  ): Promise<CachedEvents | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(getIndexedEventsCacheFile(cacheKey), 'utf-8'),
      );
      const key = blockNumber.toString();
      if (data[key] !== undefined) return data[key];
    } catch {
      /* ignore */
    }
    return null;
  },

  async getAllIndexedEvents(
    cacheKey: string,
  ): Promise<Record<string, CachedEvents>> {
    try {
      const data = JSON.parse(
        await fs.readFile(getIndexedEventsCacheFile(cacheKey), 'utf-8'),
      );
      return data;
    } catch {
      /* ignore */
    }
    return {};
  },

  async setIndexedEventsForBlocks(
    cacheKey: string,
    eventsMap: Map<bigint, CachedEvents>,
  ) {
    let data: Record<string, CachedEvents> = {};
    try {
      data = JSON.parse(
        await fs.readFile(getIndexedEventsCacheFile(cacheKey), 'utf-8'),
      );
    } catch {
      /* ignore */
    }

    // Add all new block data
    for (const [blockNumber, events] of eventsMap.entries()) {
      data[blockNumber.toString()] = events;
    }

    await fs.mkdir(path.dirname(getIndexedEventsCacheFile(cacheKey)), {
      recursive: true,
    });
    await fs.writeFile(
      getIndexedEventsCacheFile(cacheKey),
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
};

export const getRebaseRewardFromCache = async (
  args: GetRebaseRewardFromCacheArgs,
): Promise<bigint> => {
  const {
    vaultAddress,
    blockNumberPrev,
    blockNumberCurr,
    liabilitySharesPrev,
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
  });

  await cache.setRebaseReward(vaultAddress, cacheKey, reward);
  return reward;
};

type GetIndexedEventsFromCacheArgs = {
  poolAddress: Address;
  cacheSuffix?: string;
  startBlock: bigint;
  endBlock: bigint;
  fetchEventsForBlocks: (
    blocks: bigint[],
  ) => Promise<Map<bigint, CachedEvents>>;
};

export const getIndexedEventsFromCache = async (
  args: GetIndexedEventsFromCacheArgs,
): Promise<CachedEvents> => {
  const {
    poolAddress,
    cacheSuffix,
    startBlock,
    endBlock,
    fetchEventsForBlocks,
  } = args;

  const CACHE_KEY = poolAddress + (cacheSuffix ? `-${cacheSuffix}` : '');

  const allEvents: CachedEvents = {
    transfer: [],
    minted: [],
    burned: [],
  };

  const blocksToFetch: bigint[] = [];
  const totalBlocks = Number(endBlock - startBlock + 1n);

  // Read cache file once
  const cachedData = await cache.getAllIndexedEvents(CACHE_KEY);
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
      // TODO: rework to range[] instead of single blocks
      // for mainnet and earliest-latest range this can produce >20m length bigint[]
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
    await cache.setIndexedEventsForBlocks(CACHE_KEY, newEventsMap);
  }

  return allEvents;
};
