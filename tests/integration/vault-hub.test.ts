import { describe, test, expect } from 'vitest';
import { getVaultHubBaseInfo, getVaultHubRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

describe('Vault Hub Integration Tests', () => {
  test('should get vault hub base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getVaultHubBaseInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Validate required fields exist
    expect(data.LIDO).toBeDefined();
    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(data.REPORT_FRESHNESS_DELTA).toBeDefined();
    expect(data.vaultsCount).toBeDefined();
    expect(data.isPaused).toBeDefined();
    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(data.PAUSE_ROLE).toBeDefined();
    expect(data.RESUME_ROLE).toBeDefined();
    expect(data.VAULT_MASTER_ROLE).toBeDefined();

    // Validate address formats
    expect(isValidAddress(data.LIDO)).toBe(true);
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);

    // Validate role hashes
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(isValidBytes32(data.PAUSE_ROLE)).toBe(true);
    expect(isValidBytes32(data.RESUME_ROLE)).toBe(true);
    expect(isValidBytes32(data.VAULT_MASTER_ROLE)).toBe(true);
  });

  test('should get vault hub roles and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getVaultHubRoles(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // The data structure contains role information
    expect(data).toBeDefined();

    // Check that we have role data (Role, Keccak, Members format)
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);
  });
});
