import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import {
  getNodeOperatorFeeRatesByBlockNumbers,
  getSettledGrowthsByBlockNumbers,
  getNodeOperatorAccruedFeeByBlockNumbers,
  getDashboardByVault,
} from 'features';
import { DashboardContract, getDashboardContract } from 'contracts';
import { getPublicClient } from 'providers';
import { loadTestConfig } from './helpers/test-config.js';

describe('Metrics Integration Tests', () => {
  let config: ReturnType<typeof loadTestConfig>;
  let vaultAddress: Address;
  let dashboardAddress: Address | null;
  let dashboardContract: DashboardContract | null;
  let currentBlockNumber: number;

  beforeAll(async () => {
    config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;

    // Try to get dashboard address for the vault
    try {
      dashboardAddress = await getDashboardByVault(vaultAddress);
      if (dashboardAddress) {
        dashboardContract = await getDashboardContract(dashboardAddress);
      }
    } catch {
      dashboardAddress = null;
      dashboardContract = null;
    }

    // Get current block number
    const publicClient = await getPublicClient();
    const block = await publicClient.getBlockNumber();
    currentBlockNumber = Number(block);
  });

  test('should get node operator fee rates by block numbers', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    // Use current block and a few blocks before
    const blockNumbers = [
      currentBlockNumber - 10,
      currentBlockNumber - 5,
      currentBlockNumber,
    ].filter((bn) => bn > 0);

    const feeRates = await getNodeOperatorFeeRatesByBlockNumbers(
      vaultAddress,
      blockNumbers,
      dashboardContract,
    );

    expect(Array.isArray(feeRates)).toBe(true);
    expect(feeRates.length).toBe(blockNumbers.length);

    for (const feeRate of feeRates) {
      expect(typeof feeRate).toBe('bigint');
      expect(feeRate).toBeGreaterThanOrEqual(0n);
    }
  });

  test('should get settled growths by block numbers', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    // Use current block and a few blocks before
    const blockNumbers = [
      currentBlockNumber - 10,
      currentBlockNumber - 5,
      currentBlockNumber,
    ].filter((bn) => bn > 0);

    const settledGrowths = await getSettledGrowthsByBlockNumbers(
      vaultAddress,
      blockNumbers,
      dashboardContract,
    );

    expect(Array.isArray(settledGrowths)).toBe(true);
    expect(settledGrowths.length).toBe(blockNumbers.length);

    for (const settledGrowth of settledGrowths) {
      expect(typeof settledGrowth).toBe('bigint');
      expect(settledGrowth).toBeGreaterThanOrEqual(0n);
    }
  });

  test('should get node operator accrued fees by block numbers', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    // Use current block and a few blocks before
    const blockNumbers = [
      currentBlockNumber - 10,
      currentBlockNumber - 5,
      currentBlockNumber,
    ].filter((bn) => bn > 0);

    const accruedFees = await getNodeOperatorAccruedFeeByBlockNumbers(
      vaultAddress,
      blockNumbers,
      dashboardContract,
    );

    expect(Array.isArray(accruedFees)).toBe(true);
    expect(accruedFees.length).toBe(blockNumbers.length);

    for (const accruedFee of accruedFees) {
      expect(typeof accruedFee).toBe('bigint');
      expect(accruedFee).toBeGreaterThanOrEqual(0n);
    }
  });

  test('should handle empty block numbers array', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    const feeRates = await getNodeOperatorFeeRatesByBlockNumbers(
      vaultAddress,
      [],
      dashboardContract,
    );

    expect(Array.isArray(feeRates)).toBe(true);
    expect(feeRates.length).toBe(0);
  });
});
