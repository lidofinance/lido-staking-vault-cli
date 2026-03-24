import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import { checkAllowance, getDashboardByVault } from 'features';
import { DashboardContract, getDashboardContract } from 'contracts';
import { loadTestConfig } from './helpers/test-config.js';
import { setupIntegrationTestsBeforeEach } from './helpers/test-setup.js';

describe('Mint-Burn Integration Tests', () => {
  setupIntegrationTestsBeforeEach();

  let config: ReturnType<typeof loadTestConfig>;
  let vaultAddress: Address;
  let dashboardAddress: Address | null;
  let dashboardContract: DashboardContract | null;

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
  });

  test('should check allowance for stETH token', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    const testAmount = 1000000000000000000n; // 1 ETH

    let result: Awaited<ReturnType<typeof checkAllowance>> | undefined;
    let error: unknown;

    try {
      result = await checkAllowance(
        dashboardContract,
        testAmount,
        'steth',
        false,
      );
    } catch (err) {
      error = err;
    }

    // Either result is defined or error is defined (but not both)
    const hasResult = result !== undefined;
    const hasError = error !== undefined;
    expect(hasResult || hasError).toBe(true);
    expect(hasResult && hasError).toBe(false);

    // If error occurred, throw error
    if (hasError) throw error;

    // Result can be undefined if allowance is sufficient
    // or an object with receipt/tx/data if approval is needed
    const isUndefined = result === undefined;
    expect(isUndefined || typeof result === 'object').toBe(true);

    // Check properties if result is defined
    const hasReceipt = result !== undefined && 'receipt' in result;
    const hasTx = result !== undefined && 'tx' in result;
    expect(isUndefined || (hasReceipt && hasTx)).toBe(true);
  });

  test('should check allowance for wstETH token', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    const testAmount = 1000000000000000000n; // 1 ETH

    let result: Awaited<ReturnType<typeof checkAllowance>> | undefined;
    let error: unknown;

    try {
      result = await checkAllowance(
        dashboardContract,
        testAmount,
        'wsteth',
        false,
      );
    } catch (err) {
      error = err;
    }

    // Either result is defined or error is defined (but not both)
    const hasResult = result !== undefined;
    const hasError = error !== undefined;
    expect(hasResult || hasError).toBe(true);
    expect(hasResult && hasError).toBe(false);

    // If error occurred, skip further checks
    if (hasError) throw error;

    const isUndefined = result === undefined;
    expect(isUndefined || typeof result === 'object').toBe(true);

    // Check properties if result is defined
    const hasReceipt = result !== undefined && 'receipt' in result;
    const hasTx = result !== undefined && 'tx' in result;
    expect(isUndefined || (hasReceipt && hasTx)).toBe(true);
  });

  test('should check allowance for shares token', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract)
      throw new Error('Dashboard contract not found');

    const testAmount = 1000000000000000000n; // 1 share

    let result: Awaited<ReturnType<typeof checkAllowance>> | undefined;
    let error: unknown;

    try {
      result = await checkAllowance(
        dashboardContract,
        testAmount,
        'shares',
        false,
      );
    } catch (err) {
      error = err;
    }

    // Either result is defined or error is defined (but not both)
    const hasResult = result !== undefined;
    const hasError = error !== undefined;
    expect(hasResult || hasError).toBe(true);
    expect(hasResult && hasError).toBe(false);

    // If error occurred, skip further checks
    if (hasError) throw error;

    const isUndefined = result === undefined;
    expect(isUndefined || typeof result === 'object').toBe(true);

    // Check properties if result is defined
    const hasReceipt = result !== undefined && 'receipt' in result;
    const hasTx = result !== undefined && 'tx' in result;
    expect(isUndefined || (hasReceipt && hasTx)).toBe(true);
  });

  test('should check allowance with populateTx flag', async () => {
    // Skip test if no dashboard is found
    if (!dashboardAddress || !dashboardContract) return;

    const testAmount = 1000000000000000000n; // 1 ETH

    let result: Awaited<ReturnType<typeof checkAllowance>> | undefined;
    let error: unknown;

    try {
      result = await checkAllowance(
        dashboardContract,
        testAmount,
        'steth',
        true, // populateTx
      );
    } catch (err) {
      error = err;
    }

    // Either result is defined or error is defined (but not both)
    const hasResult = result !== undefined;
    const hasError = error !== undefined;
    expect(hasResult || hasError).toBe(true);
    expect(hasResult && hasError).toBe(false);

    // If error occurred, skip further checks
    if (hasError) throw error;

    // With populateTx, result should have data property if approval is needed
    const isUndefined = result === undefined;
    expect(isUndefined || typeof result === 'object').toBe(true);

    // Check data property if result is defined
    const hasDataProperty = result !== undefined && 'data' in result;
    const hasDataValue = result !== undefined && result.data !== undefined;
    const dataHasTo =
      result !== undefined && result.data !== undefined && 'to' in result.data;
    const dataHasData =
      result !== undefined &&
      result.data !== undefined &&
      'data' in result.data;
    expect(
      isUndefined ||
        (hasDataProperty && (!hasDataValue || (dataHasTo && dataHasData))),
    ).toBe(true);
  });
});
