import { describe, test, expect, beforeAll } from 'vitest';
import { checkMintingCapacity, getDashboardByVault } from 'features';
import { DashboardContract, getDashboardContract } from 'contracts';
import { loadTestConfig } from './helpers/test-config.js';
import { setupIntegrationTestsBeforeAll } from './helpers/test-setup.js';

describe('Minting Capacity Integration Tests', () => {
  setupIntegrationTestsBeforeAll();

  let dashboardContract: DashboardContract | null = null;
  let hasDashboard = false;

  beforeAll(async () => {
    const config = loadTestConfig();
    const vaultAddress = config.VAULT_ADDRESS;

    try {
      const dashboardAddress = await getDashboardByVault(vaultAddress);
      if (dashboardAddress) {
        dashboardContract = await getDashboardContract(dashboardAddress);
        hasDashboard = true;
      }
    } catch {
      dashboardContract = null;
    }
  });

  test('should return true when minting a very small amount', async () => {
    if (!hasDashboard || !dashboardContract) {
      console.warn('Skipping: no dashboard contract available');
      return;
    }

    // 1 wei of shares should always be within capacity
    const result = await checkMintingCapacity(dashboardContract, 1n);
    expect(result).toBe(true);
  });

  test('should return false when minting an extremely large amount', async () => {
    if (!hasDashboard || !dashboardContract) {
      console.warn('Skipping: no dashboard contract available');
      return;
    }

    // An impossibly large amount should exceed any vault's capacity
    const hugeAmount = 10n ** 30n;
    const result = await checkMintingCapacity(dashboardContract, hugeAmount);
    expect(result).toBe(false);
  });

  test('should return a boolean result', async () => {
    if (!hasDashboard || !dashboardContract) {
      console.warn('Skipping: no dashboard contract available');
      return;
    }

    const result = await checkMintingCapacity(dashboardContract, 0n);
    expect(typeof result).toBe('boolean');
  });
});
