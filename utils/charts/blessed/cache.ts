import fs from 'fs/promises';
import path from 'path';

const SHARE_RATE_CACHE_FILE = path.resolve(
  'ipfs-cache',
  'share-rate-cache.json',
);
const REBASE_REWARD_CACHE_FILE = path.resolve(
  'ipfs-cache',
  'rebase-rewards-cache.json',
);

export const cache = {
  async getShareRate(blockNumber: number): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(SHARE_RATE_CACHE_FILE, 'utf-8'),
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
      data = JSON.parse(await fs.readFile(SHARE_RATE_CACHE_FILE, 'utf-8'));
    } catch {
      /* ignore */
    }
    data[blockNumber] = value.toString();
    await fs.mkdir(path.dirname(SHARE_RATE_CACHE_FILE), { recursive: true });
    await fs.writeFile(SHARE_RATE_CACHE_FILE, JSON.stringify(data), 'utf-8');
  },
  async getRebaseReward(cacheKey: string): Promise<bigint | null> {
    try {
      const data = JSON.parse(
        await fs.readFile(REBASE_REWARD_CACHE_FILE, 'utf-8'),
      );
      if (data[cacheKey] !== undefined) return BigInt(data[cacheKey]);
    } catch {
      /* ignore */
    }
    return null;
  },
  async setRebaseReward(cacheKey: string, value: bigint) {
    let data: Record<string, string> = {};
    try {
      data = JSON.parse(await fs.readFile(REBASE_REWARD_CACHE_FILE, 'utf-8'));
    } catch {
      /* ignore */
    }
    data[cacheKey] = value.toString();
    await fs.mkdir(path.dirname(REBASE_REWARD_CACHE_FILE), { recursive: true });
    await fs.writeFile(REBASE_REWARD_CACHE_FILE, JSON.stringify(data), 'utf-8');
  },
};
