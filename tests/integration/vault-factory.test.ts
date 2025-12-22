import { describe, test, expect } from 'vitest';
import { getVaultFactoryInfo } from 'features';
import {
  captureLogResult,
  isValidAddress,
  validateExpectedData,
} from './helpers/test-assertions.js';

const EXPECTED_DATA_HOODI = {
  CONTRACT_ADDRESS: '0x7Ba269a03eeD86f2f54CB04CA3b4b7626636Df4E',
  BEACON: '0xb3e6a8B6A752d3bb905A1B3Ef12bbdeE77E8160e',
  LIDO_LOCATOR: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
};

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
    expect(isValidAddress(data.BEACON)).toBe(true);
    expect(data.BEACON).toBe(EXPECTED_DATA_HOODI.BEACON);

    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);
    expect(data.LIDO_LOCATOR).toBe(EXPECTED_DATA_HOODI.LIDO_LOCATOR);

    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(data.CONTRACT_ADDRESS).toBe(EXPECTED_DATA_HOODI.CONTRACT_ADDRESS);

    validateExpectedData(data, EXPECTED_DATA_HOODI, expect);
  });
});
