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
  'Reserve Ratio, BP': 500,
  'Reserve Ratio, %': '5.00%',
  'Forced Rebalance Threshold, BP': 300,
  'Forced Rebalance Threshold, %': '3.00%',
  'Infra Fee, BP': 100,
  'Infra Fee, %': '1.00%',
  'Liquidity Fee, BP': 650,
  'Liquidity Fee, %': '6.50%',
  'Reservation Fee, BP': 0,
  'Reservation Fee, %': '0.00%',
  'Share Limit, Shares': '25000',
  'Liability Shares, Shares': '0.270308321854275937',
  'Obligations (sharesToBurn), Shares': '0',
  'Obligations (feesToSettle), ETH': '0.000063852819183738',
  'Total Value, ETH': '3.93',
  'Locked, ETH': '1.274648391739846297',
  'Max Lockable Value, ETH': '3.929936147180816262',
  'Balance, ETH': '3.93',
  'Settled Growth, ETH': '0',
  'Total Minting Capacity, Shares': '2.883636485426129809',
  'Remaining Minting Capacity, Shares': '2.613328163571853872',
  'Withdrawable Value, ETH': '2.655287755440969965',
  'Node Operator Fee Recipient': '0x463f500FCb218d38FB35BECD20475ea75a79B7A9',
  'Node Operator Fee Rate, BP': 100,
  'Node Operator Fee Rate, %': '1.00%',
  'Node Operator Disbursable Fee, ETH': '0',
  'Confirm Expiry': '86400 (24 hours)',
  'Max Confirm Expiry': '2592000 (720 hours)',
  'Min Confirm Expiry': '3600 (1 hours)',
};

const EXPECTED_OVERVIEW_DATA_HOODI = {
  'Health Factor': '1387.9928%',
  'Reserve Ratio, %': '5.00%',
  'Force Rebalance Threshold, %': '3.00%',
  'stVault Share Limit, stETH': '25401.399950970627575329',
  'stVault Share Limit, Shares': '25000',
  'Node Operator Fee Rate, %': '1.00%',
  'Utilization Ratio, %': '9.3700%',
  'Total Value, ETH': '3.93',
  'Liability, stETH': '0.274648391739846297',
  'Liability, Shares': '0.270308321854275937',
  'Available To Withdrawal, ETH': '2.655287755440969965',
  'Idle Capital, ETH': '3.93',
  'Locked, ETH': '1.274648391739846297',
  'Total Locked, ETH': '1.274712244559030035',
  'Collateral, ETH': '1.274648391739846297',
  'Recently Repaid, ETH': '0',
  'Node Operator Accrued Fee, ETH': '0',
  'Reserved, ETH': '0.01445517851262349',
  'Settled Growth, ETH': '0',
  'Total Minting Capacity, Shares': '2.883636485426129809',
  'Total Minting Capacity, stETH': '2.929936147180816261',
  'Remaining Minting Capacity, stETH': '2.655287755440969965',
  'Remaining Minting Capacity, Shares': '2.613328163571853872',
  'Unsettled Lido Fees, ETH': '0.000063852819183738',
  'Shares to Burn, Shares': '0',
  'Tier ID': 5n,
  'Tier Share Limit, stETH': '25401.399950970627575329',
  'Tier Share Limit, Shares': '25000',
  'Group Share Limit, stETH': '50802.799901941255150658',
  'Group Share Limit, Shares': '50000',
};

const EXPECTED_HEALTH_DATA_HOODI = {
  'Vault Healthy': true,
  'Health Rate': '1387.9928354399083%',
  'Total Value, ETH': '3.93',
  'Liability Shares': '0.270308321854275937',
  'Liability Shares in stETH': '0.274648391739846297',
  'Forced Rebalance Threshold, %': '3.00%',
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
