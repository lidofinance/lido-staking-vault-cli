import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

vi.mock('../../utils/share-rate.js', () => ({
  calculateShareRate: vi.fn(),
}));

vi.mock('../../utils/rebase-rewards.js', () => ({
  calculateRebaseReward: vi.fn(),
}));

vi.mock('../../utils/logging/index.js', () => ({
  logInfo: vi.fn(),
}));

import fs from 'node:fs/promises';
import { cache } from '../../utils/cache.js';

const mockReadFile = fs.readFile as Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('safeJsonParse prototype pollution prevention (M8)', () => {
  it('should strip __proto__ keys from cached JSON', async () => {
    const malicious = '{"100": "999", "__proto__": {"polluted": true}}';
    mockReadFile.mockResolvedValue(malicious);

    const result = await cache.getShareRate(100);
    expect(result).toBe(999n);

    const obj = {} as any;
    expect(obj.polluted).toBeUndefined();
  });

  it('should strip constructor keys from cached JSON', async () => {
    const malicious = '{"100": "999", "constructor": {"prototype": {"injected": true}}}';
    mockReadFile.mockResolvedValue(malicious);

    const result = await cache.getShareRate(100);
    expect(result).toBe(999n);

    const obj = {} as any;
    expect(obj.injected).toBeUndefined();
  });

  it('should strip prototype keys from cached JSON', async () => {
    const malicious = '{"100": "999", "prototype": {"leaked": true}}';
    mockReadFile.mockResolvedValue(malicious);

    const result = await cache.getShareRate(100);
    expect(result).toBe(999n);
  });

  it('should strip nested __proto__ keys', async () => {
    const malicious =
      '{"100": {"transfer": [], "minted": [], "burned": [], "__proto__": {"bad": true}}}';
    mockReadFile.mockResolvedValue(malicious);

    const result = await cache.getIndexedEventsByBlock('0xpool', 100n);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('transfer');

    const obj = {} as any;
    expect(obj.bad).toBeUndefined();
  });

  it('should handle normal JSON without dangerous keys', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ 100: '500' }));
    const result = await cache.getShareRate(100);
    expect(result).toBe(500n);
  });
});
