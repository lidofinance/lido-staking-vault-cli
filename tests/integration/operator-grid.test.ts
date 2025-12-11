import { describe, test, expect } from 'vitest';
import { getOperatorGridBaseInfo, getOperatorGridRoles } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

const EXPECTED_DATA_HOODI = {
  CONTRACT_ADDRESS: '0x501e678182bB5dF3f733281521D3f3D1aDe69917',
  DEFAULT_ADMIN_ROLE:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  DEFAULT_TIER_OPERATOR: '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
  LIDO_LOCATOR: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
  REGISTRY_ROLE:
    '0xa495a3428837724c7f7648cda02eb83c9c4c778c8688d6f254c7f3f80c154d55',
  DEFAULT_TIER_ID: 0n,
  nodeOperatorCount: 7n,
};

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
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(data.CONTRACT_ADDRESS).toBe(EXPECTED_DATA_HOODI.CONTRACT_ADDRESS);

    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(data.DEFAULT_ADMIN_ROLE).toBe(
      EXPECTED_DATA_HOODI.DEFAULT_ADMIN_ROLE,
    );

    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);
    expect(data.LIDO_LOCATOR).toBe(EXPECTED_DATA_HOODI.LIDO_LOCATOR);

    expect(data.REGISTRY_ROLE).toBeDefined();
    expect(isValidBytes32(data.REGISTRY_ROLE)).toBe(true);
    expect(data.REGISTRY_ROLE).toBe(EXPECTED_DATA_HOODI.REGISTRY_ROLE);

    expect(data.DEFAULT_TIER_OPERATOR).toBeDefined();
    expect(isValidAddress(data.DEFAULT_TIER_OPERATOR)).toBe(true);
    expect(data.DEFAULT_TIER_OPERATOR).toBe(
      EXPECTED_DATA_HOODI.DEFAULT_TIER_OPERATOR,
    );

    expect(data.nodeOperatorCount).toBeDefined();
    expect(data.nodeOperatorCount).toBe(EXPECTED_DATA_HOODI.nodeOperatorCount);
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
