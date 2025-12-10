import { describe, test, expect } from 'vitest';
import { getVaultFactoryInfo } from 'features';
import { captureLogResult, isValidAddress } from './helpers/test-assertions.js';

describe('Vault Factory Integration Tests', () => {
  test('should get vault factory info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getVaultFactoryInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Validate required fields exist
    expect(data.BEACON).toBeDefined();
    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(data.CONTRACT_ADDRESS).toBeDefined();

    // Validate address formats
    expect(isValidAddress(data.BEACON)).toBe(true);
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
  });
});
