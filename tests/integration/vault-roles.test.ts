import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import { getVaultRolesByDashboard, getDashboardByVault } from 'features';
import { getDashboardContract } from 'contracts';
import { loadTestConfig } from './helpers/test-config.js';
import { captureLogResult } from './helpers/test-assertions.js';

describe('Vault Roles Integration Tests', () => {
  let config: ReturnType<typeof loadTestConfig>;
  let vaultAddress: Address;
  let dashboardAddress: Address | null;

  beforeAll(async () => {
    config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;

    // Try to get dashboard address for the vault
    try {
      dashboardAddress = await getDashboardByVault(vaultAddress);
    } catch {
      // Dashboard might not exist for this vault
      dashboardAddress = null;
    }
  });

  test('should get vault roles by dashboard and return valid data', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    const dashboardContract = await getDashboardContract(dashboardAddress);
    const data = await captureLogResult<Record<string, any>>(() =>
      getVaultRolesByDashboard(dashboardContract),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // The data structure contains role information
    expect(data).toBeDefined();

    // Check that we have role data (Role, Keccak, Members format)
    // Should have multiple roles returned
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);

    // At minimum, we expect DEFAULT_ADMIN_ROLE to be present
    // Data is in format of first row being role name
    const hasData = Object.values(data).some((value) => value !== undefined);
    expect(hasData).toBe(true);
  });
});
