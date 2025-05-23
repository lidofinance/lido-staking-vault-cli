import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { getRequiredLockByShares } from '../../utils/required-lock.js';

jest.mock('contracts', () => ({
  getStethContract: jest.fn(() => ({
    read: { getPooledEthByShares: jest.fn(() => 10n) },
  })),
  getDashboardContract: jest.fn(() => ({})),
  getStakingVaultContract: jest.fn(() => ({})),
}));

jest.mock('../../utils/index.js', () => ({
  callReadMethodSilent: jest.fn(async () => ({
    liabilityShares: 1n,
    reserveRatioBP: 100,
  })),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getRequiredLockByShares', () => {
  test('calculates required lock', async () => {
    const result = await getRequiredLockByShares('0x1', '1');
    expect(result).toHaveProperty('requiredLock');
    expect(result).toHaveProperty('currentLock');
  });
});
