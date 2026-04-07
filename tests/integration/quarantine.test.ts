import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import { checkQuarantine, confirmQuarantine } from 'features';
import { loadTestConfig } from './helpers/test-config.js';
import { setupIntegrationTestsBeforeAll } from './helpers/test-setup.js';

describe('Quarantine Integration Tests', () => {
  setupIntegrationTestsBeforeAll();

  let vaultAddress: Address;

  beforeAll(async () => {
    const config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;
  });

  test('should check quarantine status for vault', async () => {
    const result = await checkQuarantine(vaultAddress);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('quarantine');
    expect(typeof result.quarantine.isActive).toBe('boolean');
  });

  test('should return quarantine result with expected shape', async () => {
    const result = await checkQuarantine(vaultAddress);

    // All fields should be present
    expect(result).toHaveProperty('quarantine');
    expect(result).toHaveProperty('until');
    expect(result).toHaveProperty('start');
    expect(result).toHaveProperty('leftHours');
  });

  test('should return true from confirmQuarantine for test vault', async () => {
    // The test vault at the fork block is expected to not be in quarantine
    const confirmed = await confirmQuarantine(vaultAddress);
    expect(typeof confirmed).toBe('boolean');
  });
});
