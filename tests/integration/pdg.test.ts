import { describe, test, expect } from 'vitest';
import { getPdgBaseInfo, getPdgRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
  validateExpectedData,
} from './helpers/test-assertions.js';

const FIRST_VALIDATOR_GINDEX =
  '0x0000000000000000000000000000000000000000000000000096000000000028';
const VALIDATORS_GINDEX =
  '0x0000000000000000000000000000000000000000000000000000000000016600';

const EXPECTED_DATA_HOODI = {
  CONTRACT_ADDRESS: '0xa5F55f3402beA2B14AE15Dae1b6811457D43581d',
  DEFAULT_ADMIN_ROLE:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  RESUME_ROLE:
    '0xa79a6aede309e0d48bf2ef0f71355c06ad317956d4c0da2deb0dc47cc34f826c',
  PAUSE_ROLE:
    '0x8d0e4ae4847b49935b55c99f9c3ce025c87e7c4604c35b7ae56929bd32fa5a78',
  BEACON_ROOTS: '0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02',
  GI_PUBKEY_WC_PARENT:
    '0x0000000000000000000000000000000000000000000000000000000000000402',
  GI_STATE_ROOT:
    '0x0000000000000000000000000000000000000000000000000000000000000b03',
  MAX_SUPPORTED_WC_VERSION: 2,
  MIN_SUPPORTED_WC_VERSION: 1,
  PREDEPOSIT_AMOUNT: 1000000000000000000n,
  isPaused: false,
  resumeSinceTimestamp: 1765803516n,
};

// PDG renames these getters when redeployed for Gloas, so the expected shape
// depends on which deployment hoodi is running.
const EXPECTED_PRE_GLOAS = {
  GI_FIRST_VALIDATOR_CURR: FIRST_VALIDATOR_GINDEX,
  GI_FIRST_VALIDATOR_PREV: FIRST_VALIDATOR_GINDEX,
  PIVOT_SLOT: 0n,
};

const EXPECTED_GLOAS = {
  GI_FIRST_VALIDATOR_PRE_GLOAS: FIRST_VALIDATOR_GINDEX,
  GI_VALIDATORS: VALIDATORS_GINDEX,
};

describe('Predeposit Guarantee Integration Tests', () => {
  test('should get PDG base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getPdgBaseInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    const isGloasDeployment = 'GI_VALIDATORS' in data;

    validateExpectedData(
      data,
      isGloasDeployment
        ? {
            ...EXPECTED_DATA_HOODI,
            ...EXPECTED_GLOAS,
            PIVOT_SLOT: data.PIVOT_SLOT,
          }
        : { ...EXPECTED_DATA_HOODI, ...EXPECTED_PRE_GLOAS },
      expect,
    );

    // TODO: pin PIVOT_SLOT once the Gloas fork slot is set on hoodi
    expect(
      isGloasDeployment ? data.PIVOT_SLOT > 0n : data.PIVOT_SLOT === 0n,
    ).toBe(true);

    expect(isValidBytes32(data.PAUSE_ROLE)).toBe(true);
    expect(isValidBytes32(data.RESUME_ROLE)).toBe(true);
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);

    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
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
