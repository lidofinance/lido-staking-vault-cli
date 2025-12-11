import { describe, test, expect } from 'vitest';
import { getPdgBaseInfo, getPdgRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

const EXPECTED_DATA_HOODI = {
  CONTRACT_ADDRESS: '0xa5F55f3402beA2B14AE15Dae1b6811457D43581d',
  DEFAULT_ADMIN_ROLE:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  RESUME_ROLE:
    '0xa79a6aede309e0d48bf2ef0f71355c06ad317956d4c0da2deb0dc47cc34f826c',
  PAUSE_ROLE:
    '0x8d0e4ae4847b49935b55c99f9c3ce025c87e7c4604c35b7ae56929bd32fa5a78',
  BEACON_ROOTS: '0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02',
  GI_FIRST_VALIDATOR_CURR:
    '0x0000000000000000000000000000000000000000000000000096000000000028',
  GI_FIRST_VALIDATOR_PREV:
    '0x0000000000000000000000000000000000000000000000000096000000000028',
  GI_PUBKEY_WC_PARENT:
    '0x0000000000000000000000000000000000000000000000000000000000000402',
  GI_STATE_ROOT:
    '0x0000000000000000000000000000000000000000000000000000000000000b03',
  MAX_SUPPORTED_WC_VERSION: '2',
  MIN_SUPPORTED_WC_VERSION: '1',
  PREDEPOSIT_AMOUNT: 1000000000000000000n,
  PIVOT_SLOT: 0n,
  isPaused: false,
  resumeSinceTimestamp: 0n,
};

describe('Predeposit Guarantee Integration Tests', () => {
  test('should get PDG base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getPdgBaseInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Validate required fields exist
    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(data.CONTRACT_ADDRESS).toBe(EXPECTED_DATA_HOODI.CONTRACT_ADDRESS);

    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(data.DEFAULT_ADMIN_ROLE).toBe(
      EXPECTED_DATA_HOODI.DEFAULT_ADMIN_ROLE,
    );

    expect(data.RESUME_ROLE).toBeDefined();
    expect(isValidBytes32(data.RESUME_ROLE)).toBe(true);
    expect(data.RESUME_ROLE).toBe(EXPECTED_DATA_HOODI.RESUME_ROLE);

    expect(data.PAUSE_ROLE).toBeDefined();
    expect(isValidBytes32(data.PAUSE_ROLE)).toBe(true);
    expect(data.PAUSE_ROLE).toBe(EXPECTED_DATA_HOODI.PAUSE_ROLE);

    expect(data.BEACON_ROOTS).toBeDefined();
    expect(data.BEACON_ROOTS).toBe(EXPECTED_DATA_HOODI.BEACON_ROOTS);

    expect(data.GI_FIRST_VALIDATOR_CURR).toBeDefined();
    expect(data.GI_FIRST_VALIDATOR_CURR).toBe(
      EXPECTED_DATA_HOODI.GI_FIRST_VALIDATOR_CURR,
    );

    expect(data.GI_FIRST_VALIDATOR_PREV).toBeDefined();
    expect(data.GI_FIRST_VALIDATOR_PREV).toBe(
      EXPECTED_DATA_HOODI.GI_FIRST_VALIDATOR_PREV,
    );

    expect(data.GI_PUBKEY_WC_PARENT).toBeDefined();
    expect(data.GI_PUBKEY_WC_PARENT).toBe(
      EXPECTED_DATA_HOODI.GI_PUBKEY_WC_PARENT,
    );

    expect(data.GI_STATE_ROOT).toBeDefined();
    expect(data.GI_STATE_ROOT).toBe(EXPECTED_DATA_HOODI.GI_STATE_ROOT);

    expect(data.PREDEPOSIT_AMOUNT).toBeDefined();
    expect(data.PREDEPOSIT_AMOUNT).toBe(EXPECTED_DATA_HOODI.PREDEPOSIT_AMOUNT);

    expect(data.PIVOT_SLOT).toBeDefined();
    expect(data.PIVOT_SLOT).toBe(EXPECTED_DATA_HOODI.PIVOT_SLOT);

    expect(typeof data.isPaused).toBe('boolean');
    expect(data.isPaused).toBeDefined();
    expect(data.isPaused).toBe(EXPECTED_DATA_HOODI.isPaused);

    expect(data.resumeSinceTimestamp).toBeDefined();
    expect(data.resumeSinceTimestamp).toBe(
      EXPECTED_DATA_HOODI.resumeSinceTimestamp,
    );
  });

  test('should get PDG roles and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getPdgRoles(),
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
