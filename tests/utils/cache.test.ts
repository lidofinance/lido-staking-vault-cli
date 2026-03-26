import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock fs/promises before importing cache
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

// Mock utils to avoid blockchain imports — only stub the functions cache.ts uses
vi.mock('utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('utils')>();
  return {
    ...original,
    calculateShareRate: vi.fn(),
    calculateRebaseReward: vi.fn(),
  };
});

// Mock logging
vi.mock('../../utils/logging/index.js', () => ({
  logInfo: vi.fn(),
}));

import fs from 'node:fs/promises';
import {
  cache,
  getShareRateFromCache,
  getRebaseRewardFromCache,
} from '../../utils/cache.js';
import { calculateShareRate, calculateRebaseReward } from 'utils';

const mockReadFile = fs.readFile as Mock;
const mockWriteFile = fs.writeFile as Mock;
const mockMkdir = fs.mkdir as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cache.getShareRate / cache.setShareRate', () => {
  it('should return cached value when file exists and key is present', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 100: '1000000000' }));
    const result = await cache.getShareRate(100);
    expect(result).toBe(1000000000n);
  });

  it('should return null when file does not exist', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getShareRate(100);
    expect(result).toBeNull();
  });

  it('should return null when key is missing', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 200: '999' }));
    const result = await cache.getShareRate(100);
    expect(result).toBeNull();
  });

  it('should write share rate to file', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());

    await cache.setShareRate(100, 1234567890n);

    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('share-rate-cache-global.json'),
      JSON.stringify({ 100: '1234567890' }),
      'utf8',
    );
  });

  it('should merge with existing data on set', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 100: '111' }));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());

    await cache.setShareRate(200, 222n);

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ 100: '111', 200: '222' }),
      'utf8',
    );
  });
});

describe('cache.getRebaseReward / cache.setRebaseReward', () => {
  const vaultAddress = '0x1234';

  it('should return cached rebase reward', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ '100_200': '5000' }));
    const result = await cache.getRebaseReward(vaultAddress, '100_200');
    expect(result).toBe(5000n);
  });

  it('should return null when not cached', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getRebaseReward(vaultAddress, '100_200');
    expect(result).toBeNull();
  });

  it('should write rebase reward to vault-specific file', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());

    await cache.setRebaseReward(vaultAddress, '100_200', 5000n);

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining(`rebase-rewards-cache-${vaultAddress}.json`),
      JSON.stringify({ '100_200': '5000' }),
      'utf8',
    );
  });
});

describe('cache.getNodeOperatorFeeRate / cache.setNodeOperatorFeeRate', () => {
  const vaultAddress = '0xvault';

  it('should return cached fee rate', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 500: '100' }));
    const result = await cache.getNodeOperatorFeeRate(vaultAddress, 500);
    expect(result).toBe(100n);
  });

  it('should return null when not cached', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getNodeOperatorFeeRate(vaultAddress, 500);
    expect(result).toBeNull();
  });

  it('should write fee rate to vault-specific file', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());

    await cache.setNodeOperatorFeeRate(vaultAddress, 500, 100n);

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining(
        `node-operator-fee-rate-cache-${vaultAddress}.json`,
      ),
      expect.any(String),
      'utf8',
    );
  });
});

describe('cache.getSettledGrowth / cache.setSettledGrowth', () => {
  const vaultAddress = '0xvault';

  it('should return cached settled growth', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 300: '9999' }));
    const result = await cache.getSettledGrowth(vaultAddress, 300);
    expect(result).toBe(9999n);
  });

  it('should return null when not cached', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getSettledGrowth(vaultAddress, 300);
    expect(result).toBeNull();
  });
});

describe('cache.getNodeOperatorAccruedFee / cache.setNodeOperatorAccruedFee', () => {
  const vaultAddress = '0xvault';

  it('should return cached accrued fee', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 400: '7777' }));
    const result = await cache.getNodeOperatorAccruedFee(vaultAddress, 400);
    expect(result).toBe(7777n);
  });

  it('should return null when not cached', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getNodeOperatorAccruedFee(vaultAddress, 400);
    expect(result).toBeNull();
  });
});

describe('cache.getIndexedEventsByBlock / cache.setIndexedEventsForBlocks', () => {
  const cacheKey = '0xpool';

  it('should return cached events for a specific block', async () => {
    const events = {
      transfer: [{ blockNumber: '100', from: '0xa', to: '0xb', value: '1' }],
      minted: [],
      burned: [],
    };
    mockReadFile.mockResolvedValue(JSON.stringify({ 100: events }));

    const result = await cache.getIndexedEventsByBlock(cacheKey, 100n);
    expect(result).toEqual(events);
  });

  it('should return null for missing block', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 100: {} }));
    const result = await cache.getIndexedEventsByBlock(cacheKey, 200n);
    expect(result).toBeNull();
  });

  it('should return null when file does not exist', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getIndexedEventsByBlock(cacheKey, 100n);
    expect(result).toBeNull();
  });

  it('should write multiple blocks of events', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());

    const eventsMap = new Map([
      [100n, { transfer: [], minted: [], burned: [] }],
      [101n, { transfer: [], minted: [], burned: [] }],
    ]);

    await cache.setIndexedEventsForBlocks(cacheKey, eventsMap);

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const writtenData = JSON.parse(mockWriteFile.mock.calls[0]?.[1]);
    expect(writtenData['100']).toBeDefined();
    expect(writtenData['101']).toBeDefined();
  });
});

describe('cache.getAllIndexedEvents', () => {
  it('should return all cached data', async () => {
    const data = {
      100: { transfer: [], minted: [], burned: [] },
      101: { transfer: [], minted: [], burned: [] },
    };
    mockReadFile.mockResolvedValue(JSON.stringify(data));

    const result = await cache.getAllIndexedEvents('0xpool');
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('should return empty object on error', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    const result = await cache.getAllIndexedEvents('0xpool');
    expect(result).toEqual({});
  });
});

describe('getShareRateFromCache', () => {
  it('should return cached value without calling calculateShareRate', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 100: '999' }));

    const result = await getShareRateFromCache(100);
    expect(result).toBe(999n);
    expect(calculateShareRate).not.toHaveBeenCalled();
  });

  it('should call calculateShareRate and cache on miss', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());
    (calculateShareRate as Mock).mockResolvedValue(12345n);

    const result = await getShareRateFromCache(100);
    expect(result).toBe(12345n);
    expect(calculateShareRate).toHaveBeenCalledWith(100);
    expect(mockWriteFile).toHaveBeenCalled();
  });
});

describe('getRebaseRewardFromCache', () => {
  it('should return cached value without recalculating', async () => {
    // First call returns cached rebase reward
    mockReadFile.mockResolvedValue(JSON.stringify({ '100_200': '5000' }));

    const result = await getRebaseRewardFromCache({
      vaultAddress: '0xvault',
      blockNumberPrev: 100,
      blockNumberCurr: 200,
      liabilitySharesPrev: 1000n,
    });
    expect(result).toBe(5000n);
    expect(calculateRebaseReward).not.toHaveBeenCalled();
  });

  it('should calculate and cache on miss', async () => {
    // Rebase reward cache miss
    mockReadFile.mockRejectedValueOnce(new Error('ENOENT'));
    // Share rate cache for blockNumberPrev
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ 100: '1000' }));
    // Share rate cache for blockNumberCurr
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ 200: '1100' }));
    mockMkdir.mockResolvedValue(Promise.resolve());
    mockWriteFile.mockResolvedValue(Promise.resolve());
    (calculateRebaseReward as Mock).mockReturnValue(500n);

    const result = await getRebaseRewardFromCache({
      vaultAddress: '0xvault',
      blockNumberPrev: 100,
      blockNumberCurr: 200,
      liabilitySharesPrev: 1000n,
    });
    expect(result).toBe(500n);
    expect(calculateRebaseReward).toHaveBeenCalled();
  });
});
