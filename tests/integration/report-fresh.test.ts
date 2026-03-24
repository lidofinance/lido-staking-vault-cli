import { describe, test, expect, beforeAll, vi } from 'vitest';
import { type Address } from 'viem';
import {
  checkIsReportFresh,
  checkIsReportFreshThrowError,
} from 'features';
import { loadTestConfig } from './helpers/test-config.js';
import { setupIntegrationTestsBeforeAll } from './helpers/test-setup.js';

// Mock confirmOperation to auto-accept
vi.mock('utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('utils')>();
  return {
    ...original,
    confirmOperation: vi.fn().mockResolvedValue(true),
  };
});

describe('Report Fresh Integration Tests', () => {
  setupIntegrationTestsBeforeAll();

  let vaultAddress: Address;

  beforeAll(async () => {
    const config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;
  });

  test('should check if report is fresh for vault', async () => {
    const result = await checkIsReportFresh({ vault: vaultAddress });

    expect(result).toBeDefined();
    expect(typeof result.isFresh).toBe('boolean');
  });

  test('should return isFresh property as boolean', async () => {
    const result = await checkIsReportFresh({
      vault: vaultAddress,
      populateTx: false,
    });

    expect(result).toHaveProperty('isFresh');
    expect(typeof result.isFresh).toBe('boolean');
  });

  test('should handle populateTx flag', async () => {
    const result = await checkIsReportFresh({
      vault: vaultAddress,
      populateTx: true,
    });

    expect(result).toBeDefined();
    expect(typeof result.isFresh).toBe('boolean');
  });

  test('should throw for disconnected vault in checkIsReportFreshThrowError', async () => {
    // Use a random non-vault address that is not connected to VaultHub
    const disconnectedAddress =
      '0x0000000000000000000000000000000000000001' as Address;

    await expect(
      checkIsReportFreshThrowError({ vault: disconnectedAddress }),
    ).rejects.toThrow(/disconnected/i);
  });
});
