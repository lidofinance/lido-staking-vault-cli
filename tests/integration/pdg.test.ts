import { describe, test, expect } from 'vitest';
import { getPdgBaseInfo, getPdgRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

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
    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(data.RESUME_ROLE).toBeDefined();
    expect(data.PAUSE_ROLE).toBeDefined();
    expect(data.BEACON_ROOTS).toBeDefined();
    expect(data.PREDEPOSIT_AMOUNT).toBeDefined();
    expect(data.PIVOT_SLOT).toBeDefined();
    expect(data.isPaused).toBeDefined();

    // Validate address formats
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(isValidAddress(data.BEACON_ROOTS)).toBe(true);

    // Validate role hashes (roles are bytes32, not addresses)
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(isValidBytes32(data.RESUME_ROLE)).toBe(true);
    expect(isValidBytes32(data.PAUSE_ROLE)).toBe(true);

    // Validate numeric fields
    expect(typeof data.isPaused).toBe('boolean');
    expect(data.PIVOT_SLOT).toBeDefined();
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
