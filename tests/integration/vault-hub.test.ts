import { describe, test, expect } from 'vitest';
import { getVaultHubBaseInfo, getVaultHubRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
  validateExpectedData,
} from './helpers/test-assertions.js';

const EXPECTED_DATA_HOODI = {
  CONTRACT_ADDRESS: '0x4C9fFC325392090F789255b9948Ab1659b797964',
  DEFAULT_ADMIN_ROLE:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  LIDO: '0x3508A952176b3c15387C97BE809eaffB1982176a',
  LIDO_LOCATOR: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
  PAUSE_INFINITELY:
    115792089237316195423570985008687907853269984665640564039457584007913129639935n,
  PAUSE_ROLE:
    '0x8d0e4ae4847b49935b55c99f9c3ce025c87e7c4604c35b7ae56929bd32fa5a78',
  RESUME_ROLE:
    '0xa79a6aede309e0d48bf2ef0f71355c06ad317956d4c0da2deb0dc47cc34f826c',
  VAULT_MASTER_ROLE:
    '0x479bc4a51d27fbdc8e51b5b1ebd3dcd58bd229090980bff226f8930587e69ce3',
  MAX_RELATIVE_SHARE_LIMIT_BP: 1000n,
  CONNECT_DEPOSIT: '1 ETH',
  REPORT_FRESHNESS_DELTA: 172800n,
  reportFreshnessDeltaHours: '48 hours',
  resumeSinceTimestamp: 0n,
  vaultsCount: 335n,
  isPaused: false,
};

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
    expect(isValidAddress(data.LIDO)).toBe(true);
    expect(data.LIDO).toBe(EXPECTED_DATA_HOODI.LIDO);

    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);
    expect(data.LIDO_LOCATOR).toBe(EXPECTED_DATA_HOODI.LIDO_LOCATOR);

    expect(data.REPORT_FRESHNESS_DELTA).toBeDefined();
    expect(data.REPORT_FRESHNESS_DELTA).toBe(
      EXPECTED_DATA_HOODI.REPORT_FRESHNESS_DELTA,
    );

    expect(data.vaultsCount).toBeDefined();
    expect(data.vaultsCount).toBe(EXPECTED_DATA_HOODI.vaultsCount);

    expect(data.isPaused).toBeDefined();
    expect(data.isPaused).toBe(EXPECTED_DATA_HOODI.isPaused);

    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(data.CONTRACT_ADDRESS).toBe(EXPECTED_DATA_HOODI.CONTRACT_ADDRESS);

    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(data.DEFAULT_ADMIN_ROLE).toBe(
      EXPECTED_DATA_HOODI.DEFAULT_ADMIN_ROLE,
    );

    expect(data.PAUSE_ROLE).toBeDefined();
    expect(isValidBytes32(data.PAUSE_ROLE)).toBe(true);
    expect(data.PAUSE_ROLE).toBe(EXPECTED_DATA_HOODI.PAUSE_ROLE);

    expect(data.RESUME_ROLE).toBeDefined();
    expect(isValidBytes32(data.RESUME_ROLE)).toBe(true);
    expect(data.RESUME_ROLE).toBe(EXPECTED_DATA_HOODI.RESUME_ROLE);

    expect(data.VAULT_MASTER_ROLE).toBeDefined();
    expect(isValidBytes32(data.VAULT_MASTER_ROLE)).toBe(true);
    expect(data.VAULT_MASTER_ROLE).toBe(EXPECTED_DATA_HOODI.VAULT_MASTER_ROLE);

    validateExpectedData(data, EXPECTED_DATA_HOODI, expect);
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
