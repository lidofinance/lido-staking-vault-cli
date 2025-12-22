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
import {
  captureLogTable,
  isValidAddress,
  validateExpectedData,
} from './helpers/test-assertions.js';

const EXPECTED_INFO_DATA_HOODI = {
  'Vault address': '0x7FbB823699d961bD7A08cBb631bB71242ec86a56',
  'Dashboard address': '0x318FcB0CCE93aBA9C21a1B4B38dbACcCEfF091E0',
  'Vault Hub address': '0x4C9fFC325392090F789255b9948Ab1659b797964',
  'LIDO Locator address': '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
  'stETH address': '0x3508A952176b3c15387C97BE809eaffB1982176a',
  'wstETH address': '0x7E99eE3C66636DE415D2d7C880938F2f40f94De4',
  'Node Operator': '0x463f500FCb218d38FB35BECD20475ea75a79B7A9',
  'Reserve Ratio, BP': 5000,
  'Reserve Ratio, %': '50.00%',
  'Forced Rebalance Threshold, BP': 4950,
  'Forced Rebalance Threshold, %': '49.50%',
  'Infra Fee, BP': 100,
  'Infra Fee, %': '1.00%',
  'Liquidity Fee, BP': 650,
  'Liquidity Fee, %': '6.50%',
  'Reservation Fee, BP': 0,
  'Reservation Fee, %': '0.00%',
  'Share Limit, Shares': '0',
  'Liability Shares, Shares': '0',
  'Obligations (sharesToBurn), Shares': '0',
  'Obligations (feesToSettle), ETH': '0.000036827206668696',
  'Total Value, ETH': '1.01',
  'Locked, ETH': '1',
  'Max Lockable Value, ETH': '1.009963172793331304',
  'Balance, ETH': '1.01',
  'Settled Growth, ETH': '0',
  'Total Minting Capacity, Shares': '0',
  'Remaining Minting Capacity, Shares': '0',
  'Withdrawable Value, ETH': '0.009963172793331304',
  'Node Operator Fee Recipient': '0x463f500FCb218d38FB35BECD20475ea75a79B7A9',
  'Node Operator Fee Rate, BP': 100,
  'Node Operator Fee Rate, %': '1.00%',
  'Node Operator Disbursable Fee, ETH': '0',
  'Confirm Expiry': '86400 (24 hours)',
  'Max Confirm Expiry': '2592000 (720 hours)',
  'Min Confirm Expiry': '3600 (1 hours)',
};

const EXPECTED_OVERVIEW_DATA_HOODI = {
  'Health Factor': '∞',
  'Reserve Ratio, %': '50.00%',
  'Force Rebalance Threshold, %': '49.50%',
  'stVault Share Limit, stETH': '0',
  'stVault Share Limit, Shares': '0',
  'Node Operator Fee Rate, %': '1.00%',
  'Utilization Ratio, %': '0.0000%',
  'Total Value, ETH': '1.01',
  'Liability, stETH': '0',
  'Liability, Shares': '0',
  'Available To Withdrawal, ETH': '0.009963172793331304',
  'Idle Capital, ETH': '1.01',
  'Locked, ETH': '1',
  'Total Locked, ETH': '1.000036827206668696',
  'Collateral, ETH': '1',
  'Recently Repaid, ETH': '0',
  'Node Operator Accrued Fee, ETH': '0',
  'Reserved, ETH': '0',
  'Settled Growth, ETH': '0',
  'Total Minting Capacity, Shares': '0',
  'Total Minting Capacity, stETH': '0',
  'Remaining Minting Capacity, stETH': '0',
  'Remaining Minting Capacity, Shares': '0',
  'Unsettled Lido Fees, ETH': '0.000036827206668696',
  'Shares to Burn, Shares': '0',
  'Tier ID': 0n,
  'Tier Share Limit, stETH': '101533.025204961964046572',
  'Tier Share Limit, Shares': '100001',
  'Group Share Limit, stETH': 'N/A',
  'Group Share Limit, Shares': 'N/A',
};

const EXPECTED_HEALTH_DATA_HOODI = {
  'Vault Healthy': true,
  'Health Rate': 'Infinity%',
  'Total Value, ETH': '1.01',
  'Liability Shares': '0',
  'Liability Shares in stETH': '0',
  'Forced Rebalance Threshold, %': '49.50%',
};

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

    // Validate that the data matches the expected data

    for (const key in EXPECTED_INFO_DATA_HOODI) {
      expect(tableData[key]).toBeDefined();
      expect(tableData[key]).toBe(
        EXPECTED_INFO_DATA_HOODI[key as keyof typeof EXPECTED_INFO_DATA_HOODI],
      );
    }

    validateExpectedData(tableData, EXPECTED_INFO_DATA_HOODI, expect);
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

    validateExpectedData(tableData, EXPECTED_HEALTH_DATA_HOODI, expect);
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

    validateExpectedData(tableData, EXPECTED_OVERVIEW_DATA_HOODI, expect);
  });
});
