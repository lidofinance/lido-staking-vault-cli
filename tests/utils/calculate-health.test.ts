import { describe, it, expect } from 'vitest';
import { calculateHealth } from '../../utils/health/calculate-health.js';

describe('calculateHealth', () => {
  it('should calculate healthy vault with 100% health ratio', () => {
    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 0, // 0%
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBeCloseTo(100, 2);
    expect(result.isHealthy).toBe(true);
  });

  it('should calculate healthy vault with excess collateral', () => {
    const args = {
      totalValue: 1500000000000000000000n, // 1500 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 0, // 0%
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBeCloseTo(150, 2);
    expect(result.isHealthy).toBe(true);
  });

  it('should calculate unhealthy vault with insufficient collateral', () => {
    const args = {
      totalValue: 900000000000000000000n, // 900 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 0, // 0%
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBeCloseTo(90, 2);
    expect(result.isHealthy).toBe(false);
  });

  it('should apply forced rebalance threshold correctly', () => {
    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 500, // 5%
    };

    const result = calculateHealth(args);

    // With 5% threshold: (1000 * (10000-500) / 10000) / 1000 * 100 = 95%
    expect(result.healthRatio).toBeCloseTo(95, 2);
    expect(result.isHealthy).toBe(false);
  });

  it('should apply 10% forced rebalance threshold', () => {
    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 1000, // 10%
    };

    const result = calculateHealth(args);

    // With 10% threshold: (1000 * (10000-1000) / 10000) / 1000 * 100 = 90%
    expect(result.healthRatio).toBeCloseTo(90, 2);
    expect(result.isHealthy).toBe(false);
  });

  it('should handle zero liability as healthy with Infinity ratio', () => {
    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      liabilitySharesInStethWei: 0n, // 0 ETH
      forcedRebalanceThresholdBP: 0,
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBe(Infinity);
    expect(result.isHealthy).toBe(true);
  });

  it('should handle very small liabilities', () => {
    const args = {
      totalValue: 1000000000000000000n, // 1 ETH
      liabilitySharesInStethWei: 1000000000000000n, // 0.001 ETH
      forcedRebalanceThresholdBP: 0,
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBeCloseTo(100000, 1); // 1 / 0.001 * 100
    expect(result.isHealthy).toBe(true);
  });

  it('should handle very large values without overflow', () => {
    const args = {
      totalValue: 1000000000000000000000000n, // 1,000,000 ETH
      liabilitySharesInStethWei: 900000000000000000000000n, // 900,000 ETH
      forcedRebalanceThresholdBP: 0,
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBeCloseTo(111.11, 1);
    expect(result.isHealthy).toBe(true);
  });

  it('should calculate exactly 100% health ratio at threshold', () => {
    const args = {
      totalValue: 1050000000000000000000n, // 1050 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 500, // 5%
    };

    const result = calculateHealth(args);

    // (1050 * 0.95) / 1000 * 100 = 99.75%
    expect(result.healthRatio).toBeCloseTo(99.75, 2);
    expect(result.isHealthy).toBe(false);
  });

  it('should return healthRatio18 with 18 decimals precision', () => {
    const args = {
      totalValue: 1500000000000000000000n, // 1500 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 0,
    };

    const result = calculateHealth(args);

    expect(result.healthRatio18).toBe(150000000000000000000n); // 150 * 10^18
    expect(Number(result.healthRatio18) / 1e18).toBeCloseTo(150, 2);
  });

  it('should handle minimal threshold of 1 basis point', () => {
    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 1, // 0.01%
    };

    const result = calculateHealth(args);

    // (1000 * 9999/10000) / 1000 * 100 = 99.99%
    expect(result.healthRatio).toBeCloseTo(99.99, 2);
    expect(result.isHealthy).toBe(false);
  });

  it('should handle maximum threshold of 9999 basis points', () => {
    const args = {
      totalValue: 10000000000000000000000n, // 10,000 ETH
      liabilitySharesInStethWei: 1000000000000000000000n, // 1000 ETH
      forcedRebalanceThresholdBP: 9999, // 99.99%
    };

    const result = calculateHealth(args);

    // (10000 * 0.0001) / 1000 * 100 = 0.1%
    expect(result.healthRatio).toBeCloseTo(0.1, 2);
    expect(result.isHealthy).toBe(false);
  });

  it('should handle edge case with exact 100% health after threshold', () => {
    const args = {
      totalValue: 10526315789473684210526n, // ~10526.32 ETH
      liabilitySharesInStethWei: 10000000000000000000000n, // 10000 ETH
      forcedRebalanceThresholdBP: 500, // 5%
    };

    const result = calculateHealth(args);

    expect(result.healthRatio).toBeCloseTo(100, 0);
    expect(result.isHealthy).toBe(true);
  });
});
