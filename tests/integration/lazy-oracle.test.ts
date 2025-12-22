import { describe, test, expect } from 'vitest';
import { getLazyOracleBaseInfo } from 'features';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
  validateExpectedData,
} from './helpers/test-assertions.js';

const EXPECTED_DATA_HOODI = {
  CONTRACT_ADDRESS: '0xf41491C79C30e8f4862d3F4A5b790171adB8e04A',
  LIDO_LOCATOR: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
  DEFAULT_ADMIN_ROLE:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  UPDATE_SANITY_PARAMS_ROLE:
    '0x7baf7f4a9784fa74c97162de631a3eb567edeb85878cb6965945310f2c512c63',
  MAX_QUARANTINE_PERIOD: '2592000 (720 hours)',
  MAX_REWARD_RATIO: 65535n,
  MAX_LIDO_FEE_RATE_PER_SECOND: 10000000000000000000n,
  latestReportTimestamp: '1766379660 (22.12.2025 05:01 UTC)',
  quarantinePeriod: '259200 (72 hours)',
  maxRewardRatioBP: '350 (3.5 %)',
  maxLidoFeeRatePerSecond: '180000000000000000 (0.18 ETH/s)',
};

describe('Lazy Oracle Integration Tests', () => {
  test('should get lazy oracle base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getLazyOracleBaseInfo(),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    validateExpectedData(data, EXPECTED_DATA_HOODI, expect);

    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(isValidAddress(data.LIDO_LOCATOR)).toBe(true);

    expect(isValidBytes32(data.UPDATE_SANITY_PARAMS_ROLE)).toBe(true);
    expect(isValidBytes32(data.DEFAULT_ADMIN_ROLE)).toBe(true);
  });
});
