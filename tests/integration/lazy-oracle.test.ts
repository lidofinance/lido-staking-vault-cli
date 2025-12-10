import { describe, test, expect } from 'vitest';
import { getLazyOracleBaseInfo } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
} from './helpers/test-assertions.js';

describe('Lazy Oracle Integration Tests', () => {
  test('should get lazy oracle base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getLazyOracleBaseInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    // Validate required fields exist
    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(data.LIDO_LOCATOR).toBeDefined();
    expect(data.DEFAULT_ADMIN_ROLE).toBeDefined();
    expect(data.UPDATE_SANITY_PARAMS_ROLE).toBeDefined();
    expect(data.MAX_QUARANTINE_PERIOD).toBeDefined();
    expect(data.MAX_REWARD_RATIO).toBeDefined();
    expect(data.latestReportTimestamp).toBeDefined();

    // Validate address formats (CONTRACT_ADDRESS and LIDO_LOCATOR are addresses)
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);

    // Validate role hashes (roles are bytes32, not addresses)
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
    expect(isValidBytes32(data.UPDATE_SANITY_PARAMS_ROLE)).toBe(true);
  });
});
