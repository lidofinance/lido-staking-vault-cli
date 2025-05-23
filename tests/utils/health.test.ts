import { describe, test, expect } from '@jest/globals';
import { calculateHealth } from '../../utils/health/calculate-health.js';

describe('calculateHealth', () => {
  test('healthy case', () => {
    const res = calculateHealth({
      totalValue: 10n,
      liabilitySharesInStethWei: 5n,
      forceRebalanceThresholdBP: 1000,
    });
    expect(res.isHealthy).toBe(true);
    expect(res.healthRatio).toBeGreaterThan(0);
  });

  test('infinite when no liability', () => {
    const res = calculateHealth({
      totalValue: 10n,
      liabilitySharesInStethWei: 0n,
      forceRebalanceThresholdBP: 1000,
    });
    expect(res.healthRatio).toBe(Infinity);
  });
});
