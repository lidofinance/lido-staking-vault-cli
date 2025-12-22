import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import {
  checkIsReportFresh,
  checkIsDisconnected,
  checkQuarantine,
  checkMintingCapacity,
  checkLiabilityShares,
} from 'features';
import { getDashboardContract } from 'contracts';
import { loadTestConfig } from './helpers/test-config.js';

describe('Utils Integration Tests', () => {
  let config: ReturnType<typeof loadTestConfig>;
  let vaultAddress: Address;
  let dashboardAddress: Address | null;

  beforeAll(async () => {
    config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;

    // Try to get dashboard address for the vault
    try {
      const { getDashboardByVault } = await import('features');
      dashboardAddress = await getDashboardByVault(vaultAddress);
    } catch {
      dashboardAddress = null;
    }
  });

  test('should check if vault is disconnected', async () => {
    const isDisconnected = await checkIsDisconnected(vaultAddress);

    expect(typeof isDisconnected).toBe('boolean');
    // Vault should be connected in test environment
    expect(isDisconnected).toBe(false);
  });

  test('should check if report is fresh', async () => {
    const result = await checkIsReportFresh({
      vault: vaultAddress,
      populateTx: false,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('isFresh');
    expect(typeof result.isFresh).toBe('boolean');
    // In test environment, report should be fresh
    expect(result.isFresh).toBe(true);
  });

  test('should check quarantine status', async () => {
    const result = await checkQuarantine(vaultAddress);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('quarantine');
    expect(result).toHaveProperty('until');
    expect(result).toHaveProperty('start');
    expect(result).toHaveProperty('leftHours');

    expect(result.quarantine).toBeDefined();
    expect(result.quarantine).toHaveProperty('isActive');
    expect(typeof result.quarantine.isActive).toBe('boolean');
  });

  test('should check minting capacity', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    const dashboardContract = await getDashboardContract(dashboardAddress);
    const testAmount = 1000000000000000000n; // 1 ETH in wei

    const result = await checkMintingCapacity(dashboardContract, testAmount);

    expect(typeof result).toBe('boolean');
    // Result should be true if capacity is sufficient, false otherwise
  });

  test('should check liability shares', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    const dashboardContract = await getDashboardContract(dashboardAddress);
    const testAmount = 1000000000000000000n; // 1 ETH in wei

    const result = await checkLiabilityShares(dashboardContract, testAmount);

    expect(typeof result).toBe('boolean');
    // Result should be true if amount <= liability shares, false otherwise
  });
});
