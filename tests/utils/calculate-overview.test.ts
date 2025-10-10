import { describe, test, expect } from '@jest/globals';

import {
  calculateOverview,
  formatBP,
  formatRatio,
} from '../../utils/calculate-overview.js';

const big = (n: number) => BigInt(n);

describe('calculateOverview', () => {
  test('basic calculation', () => {
    const result = calculateOverview({
      totalValue: big(1000),
      reserveRatioBP: 1000,
      liabilitySharesInStethWei: big(300),
      forcedRebalanceThresholdBP: 1100,
      withdrawableEther: big(200),
      balance: big(50),
      locked: big(80),
      nodeOperatorUnclaimedFee: big(10),
      totalMintingCapacityStethWei: big(400),
    });

    expect(result.healthRatio).toBeGreaterThan(0);
    expect(result.totalLocked).toBe(90n);
    expect(result.utilizationRatio).toBeCloseTo(75);
  });
});

describe('format helpers', () => {
  test('formatBP', () => {
    expect(formatBP(2500)).toBe('25.00%');
  });
  test('formatRatio', () => {
    expect(formatRatio(1.23456)).toBe('1.2346%');
  });
});
