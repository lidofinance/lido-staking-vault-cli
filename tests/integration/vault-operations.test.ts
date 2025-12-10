import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import {
  getVaultInfoByDashboard,
  getVaultHealthByDashboard,
  getVaultOverviewByDashboard,
  getDashboardByVault,
} from 'features';
import { getDashboardContract } from 'contracts';
import { loadTestConfig } from './helpers/test-config.js';
import { captureLogTable, isValidAddress } from './helpers/test-assertions.js';

describe('Vault Operations Integration Tests', () => {
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

  test('should get dashboard by vault if available', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    expect(dashboardAddress).toBeDefined();
    expect(typeof dashboardAddress).toBe('string');
    expect(isValidAddress(dashboardAddress)).toBe(true);
  });

  test('should get vault info by dashboard and return valid data', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    const dashboardContract = await getDashboardContract(dashboardAddress);
    const tableData = await captureLogTable<Record<string, any>>(() =>
      getVaultInfoByDashboard(dashboardContract),
    );

    // Validate that data was captured
    expect(tableData).not.toBeNull();
    if (!tableData) return;

    // Check that we have data
    expect(Object.keys(tableData).length).toBeGreaterThan(0);
  });

  test('should get vault health by dashboard and return valid data', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    const dashboardContract = await getDashboardContract(dashboardAddress);
    const tableData = await captureLogTable<Record<string, any>>(() =>
      getVaultHealthByDashboard(dashboardContract),
    );

    // Validate that data was captured
    expect(tableData).not.toBeNull();
    if (!tableData) return;

    // Check that we have health data
    expect(Object.keys(tableData).length).toBeGreaterThan(0);
  });

  test('should get vault overview by dashboard and return valid data', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress) return;

    const dashboardContract = await getDashboardContract(dashboardAddress);
    const tableData = await captureLogTable<Record<string, any>>(() =>
      getVaultOverviewByDashboard(dashboardContract),
    );

    // Validate that data was captured
    expect(tableData).not.toBeNull();
    if (!tableData) return;

    // Check that we have overview data
    expect(Object.keys(tableData).length).toBeGreaterThan(0);
  });
});
