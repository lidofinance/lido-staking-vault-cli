import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import { getVaultBaseInfo } from 'features';
import { loadTestConfig } from './helpers/test-config.js';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

describe('Vault Integration Tests', () => {
  let config: ReturnType<typeof loadTestConfig>;
  let vaultAddress: Address;

  beforeAll(async () => {
    config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;
  });

  test('should get vault base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getVaultBaseInfo(vaultAddress),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Validate required fields exist
    expect(data.DEPOSIT_CONTRACT).toBeDefined();
    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(data.owner).toBeDefined();
    expect(data.nodeOperator).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.balance).toBeDefined();
    expect(data.availableBalance).toBeDefined();
    expect(data.stagedBalance).toBeDefined();
    expect(data.withdrawalCredentials).toBeDefined();
    expect(data.initializedVersion).toBeDefined();

    // Validate address formats
    expect(isValidAddress(data.DEPOSIT_CONTRACT)).toBe(true);
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(isValidAddress(data.owner)).toBe(true);
    expect(isValidAddress(data.nodeOperator)).toBe(true);

    // withdrawalCredentials is bytes32 (not an address)
    expect(isValidBytes32(data.withdrawalCredentials)).toBe(true);

    // Validate CONTRACT_ADDRESS matches vaultAddress
    expect(data.CONTRACT_ADDRESS.toLowerCase()).toBe(
      vaultAddress.toLowerCase(),
    );

    // Validate string format of balances
    expect(data.balance).toContain('ETH');
    expect(data.availableBalance).toContain('ETH');
    expect(data.stagedBalance).toContain('ETH');
  });
});
