import { describe, it, expect, vi } from 'vitest';
import { calculateOverviewV2 } from 'utils';
import * as healthModule from 'utils/health/calculate-health.js';

vi.mock('utils/health/calculate-health');

describe('calculateOverviewV2', () => {
  const mockCalculateHealth = vi.spyOn(healthModule, 'calculateHealth');

  it('should calculate overview with basic values', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 150,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      reserveRatioBP: 1000, // 10%
      liabilitySharesInStethWei: 900000000000000000000n, // 900 ETH
      forcedRebalanceThresholdBP: 500, // 5%
      withdrawableEther: 100000000000000000000n, // 100 ETH
      balance: 100000000000000000000n, // 100 ETH
      locked: 50000000000000000000n, // 50 ETH
      nodeOperatorAccruedFee: 10000000000000000000n, // 10 ETH
      totalMintingCapacityStethWei: 1000000000000000000000n, // 1000 ETH
      unsettledLidoFees: 5000000000000000000n, // 5 ETH
      lastReportMaxLiabilityInStethWei: 800000000000000000000n, // 800 ETH
    };

    const result = calculateOverviewV2(args);

    expect(result.healthRatio).toBe(150);
    expect(result.isHealthy).toBe(true);
    expect(result.availableToWithdrawal).toBe(100000000000000000000n);
    expect(result.idleCapital).toBe(100000000000000000000n);
    expect(result.totalLocked).toBe(65000000000000000000n); // 50 + 10 + 5
    expect(result.collateral).toBe(50000000000000000000n); // equals locked
    expect(result.recentlyRepaid).toBe(0n); // liability increased, not decreased
    expect(result.totalMintingCapacityStethWei).toBe(1000000000000000000000n);
  });

  it('should calculate utilization ratio correctly', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 150,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000000n,
      reserveRatioBP: 1000,
      liabilitySharesInStethWei: 750000000000000000000n, // 75% of capacity
      forcedRebalanceThresholdBP: 500,
      withdrawableEther: 100000000000000000000n,
      balance: 100000000000000000000n,
      locked: 50000000000000000000n,
      nodeOperatorAccruedFee: 10000000000000000000n,
      totalMintingCapacityStethWei: 1000000000000000000000n,
      unsettledLidoFees: 5000000000000000000n,
      lastReportMaxLiabilityInStethWei: 700000000000000000000n,
    };

    const result = calculateOverviewV2(args);

    // Expected: (750 / 1000) * 100 = 75%
    expect(result.utilizationRatio).toBeCloseTo(75, 1);
  });

  it('should handle zero totalMintingCapacity without division by zero', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 150,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000000n,
      reserveRatioBP: 1000,
      liabilitySharesInStethWei: 900000000000000000000n,
      forcedRebalanceThresholdBP: 500,
      withdrawableEther: 100000000000000000000n,
      balance: 100000000000000000000n,
      locked: 50000000000000000000n,
      nodeOperatorAccruedFee: 10000000000000000000n,
      totalMintingCapacityStethWei: 0n, // Zero capacity
      unsettledLidoFees: 5000000000000000000n,
      lastReportMaxLiabilityInStethWei: 800000000000000000000n,
    };

    const result = calculateOverviewV2(args);

    expect(result.utilizationRatio).toBe(0);
  });

  it('should calculate recently repaid when liability decreased', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 150,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000000n,
      reserveRatioBP: 1000,
      liabilitySharesInStethWei: 700000000000000000000n, // 700 ETH
      forcedRebalanceThresholdBP: 500,
      withdrawableEther: 100000000000000000000n,
      balance: 100000000000000000000n,
      locked: 50000000000000000000n,
      nodeOperatorAccruedFee: 10000000000000000000n,
      totalMintingCapacityStethWei: 1000000000000000000000n,
      unsettledLidoFees: 5000000000000000000n,
      lastReportMaxLiabilityInStethWei: 900000000000000000000n, // 900 ETH
    };

    const result = calculateOverviewV2(args);

    // Recently repaid = 900 - 700 = 200 ETH
    expect(result.recentlyRepaid).toBe(200000000000000000000n);
  });

  it('should handle 0% reserve ratio', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 150,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000000n,
      reserveRatioBP: 0, // 0%
      liabilitySharesInStethWei: 900000000000000000000n,
      forcedRebalanceThresholdBP: 500,
      withdrawableEther: 100000000000000000000n,
      balance: 100000000000000000000n,
      locked: 50000000000000000000n,
      nodeOperatorAccruedFee: 10000000000000000000n,
      totalMintingCapacityStethWei: 1000000000000000000000n,
      unsettledLidoFees: 5000000000000000000n,
      lastReportMaxLiabilityInStethWei: 800000000000000000000n,
    };

    const result = calculateOverviewV2(args);

    // With 0% reserve ratio, oneMinusRR = 10000, reserved = 0
    // collateral = locked = 50 ETH
    expect(result.reserved).toBe(0n);
    expect(result.collateral).toBe(50000000000000000000n);
  });

  it('should calculate reserved correctly', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 150,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000000n, // 1000 ETH
      reserveRatioBP: 1000, // 10%
      liabilitySharesInStethWei: 900000000000000000000n, // 900 ETH
      forcedRebalanceThresholdBP: 500,
      withdrawableEther: 100000000000000000000n,
      balance: 100000000000000000000n,
      locked: 50000000000000000000n,
      nodeOperatorAccruedFee: 10000000000000000000n,
      totalMintingCapacityStethWei: 1000000000000000000000n,
      unsettledLidoFees: 5000000000000000000n,
      lastReportMaxLiabilityInStethWei: 800000000000000000000n,
    };

    const result = calculateOverviewV2(args);

    // Reserved should be min of (totalValue - liability, reservedByFormula)
    // totalValue - liability = 1000 - 900 = 100 ETH
    // reservedByFormula = ceil(900 * 10000 / 9000) - 900 = 1000 - 900 = 100 ETH
    // reserved = min(100, 100) = 100 ETH
    expect(result.reserved).toBe(100000000000000000000n);
  });

  it('should handle very small values without overflow', () => {
    mockCalculateHealth.mockReturnValue({
      healthRatio: 100,
      healthRatio18: 150000000000000000000n,
      isHealthy: true,
    });

    const args = {
      totalValue: 1000000000000000000n, // 1 ETH
      reserveRatioBP: 1000,
      liabilitySharesInStethWei: 900000000000000000n, // 0.9 ETH
      forcedRebalanceThresholdBP: 500,
      withdrawableEther: 100000000000000000n,
      balance: 100000000000000000n,
      locked: 0n,
      nodeOperatorAccruedFee: 0n,
      totalMintingCapacityStethWei: 1000000000000000000n,
      unsettledLidoFees: 0n,
      lastReportMaxLiabilityInStethWei: 900000000000000000n,
    };

    const result = calculateOverviewV2(args);

    expect(result.healthRatio).toBe(100);
    expect(result.isHealthy).toBe(true);
    expect(result.totalLocked).toBe(0n);
    expect(result.collateral).toBe(0n);
  });
});
