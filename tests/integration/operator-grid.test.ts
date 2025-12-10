import { describe, test, expect } from 'vitest';
import { getOperatorGridBaseInfo, getOperatorGridRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

describe('Operator Grid Integration Tests', () => {
  test('should get operator grid base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getOperatorGridBaseInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Validate required fields exist
    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(data.REGISTRY_ROLE).toBeDefined();
    expect(data.DEFAULT_TIER_OPERATOR).toBeDefined();
    expect(data.nodeOperatorCount).toBeDefined();

    // Validate address formats
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);
    expect(isValidAddress(data.DEFAULT_TIER_OPERATOR)).toBe(true);

    // Validate role hashes (roles are bytes32, not addresses)
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(isValidBytes32(data.REGISTRY_ROLE)).toBe(true);
  });

  test('should get operator grid roles and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getOperatorGridRoles(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Roles data structure: first element is role name
    expect(data).toBeDefined();

    // Check that we have role data (Role, Keccak, Members format)
    // The first key should be a role name like 'DEFAULT_ADMIN_ROLE'
    const keys = Object.keys(data);
    expect(keys.length).toBeGreaterThan(0);
  });
});
