import fs from 'fs/promises';
import path from 'path';

import { calculateShareRate, calculateRebaseReward } from 'utils';

const getShareRateCacheFile = () =>
  path.resolve('ipfs-cache', `share-rate-cache-global.json`);
const getRebaseRewardCacheFile = (vaultAddress: string) =>
  path.resolve('ipfs-cache', `rebase-rewards-cache-${vaultAddress}.json`);
const getNodeOperatorFeeBPCacheFile = (vaultAddress: string) =>
  path.resolve('ipfs-cache', `node-operator-fee-bp-cache-${vaultAddress}.json`);

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
  async getNodeOperatorFeeBP(
    vaultAddress: string,
    blockNumber: number,
  ): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(getNodeOperatorFeeBPCacheFile(vaultAddress), 'utf-8'),
      );
      if (data[blockNumber] !== undefined) return BigInt(data[blockNumber]);
    } catch {
      /* ignore */
    }
    return null;
  },
  async setNodeOperatorFeeBP(
    vaultAddress: string,
    blockNumber: number,
    value: bigint,
  ) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(
        await fs.readFile(getNodeOperatorFeeBPCacheFile(vaultAddress), 'utf-8'),
      );
    } catch {
      /* ignore */
    }
    data[blockNumber] = value.toString();
    await fs.mkdir(path.dirname(getNodeOperatorFeeBPCacheFile(vaultAddress)), {
      recursive: true,
    });
    await fs.writeFile(
      getNodeOperatorFeeBPCacheFile(vaultAddress),
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
