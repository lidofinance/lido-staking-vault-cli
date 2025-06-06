import fs from 'fs/promises';
import path from 'path';

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
