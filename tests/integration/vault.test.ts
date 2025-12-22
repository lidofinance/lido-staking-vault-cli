import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import { getVaultBaseInfo } from 'features';
import { loadTestConfig } from './helpers/test-config.js';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
  validateExpectedData,
} from './helpers/test-assertions.js';

const EXPECTED_BASE_INFO_DATA_HOODI = {
  DEPOSIT_CONTRACT: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
  CONTRACT_ADDRESS: '0x7FbB823699d961bD7A08cBb631bB71242ec86a56',
  owner: '0x4C9fFC325392090F789255b9948Ab1659b797964',
  pendingOwner: '0x0000000000000000000000000000000000000000',
  depositor: '0xa5F55f3402beA2B14AE15Dae1b6811457D43581d',
  nodeOperator: '0x463f500FCb218d38FB35BECD20475ea75a79B7A9',
  beaconChainDepositsPaused: false,
  initializedVersion: 1n,
  version: 1n,
  balance: '3.93 ETH',
  availableBalance: '3.93 ETH',
  stagedBalance: '0 ETH',
  isOwnerContract: true,
  withdrawalCredentials:
    '0x0200000000000000000000007fbb823699d961bd7a08cbb631bb71242ec86a56',
};

describe('Vault Integration Tests', () => {
  let config: ReturnType<typeof loadTestConfig>;
  let vaultAddress: Address;

  beforeAll(async () => {
    config = loadTestConfig();
    vaultAddress = config.VAULT_ADDRESS;
  });

  test('should get vault base info and return valid data', async () => {
    const data = await captureLogResult<Record<string, any>>(() =>
      getVaultBaseInfo(vaultAddress),
    );

    // Validate that data was captured
    expect(data).not.toBeNull();
    if (!data) return;

    validateExpectedData(data, EXPECTED_BASE_INFO_DATA_HOODI, expect);

    expect(isValidBytes32(data.withdrawalCredentials)).toBe(true);
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);

    expect(isValidAddress(data.nodeOperator)).toBe(true);
    expect(isValidAddress(data.DEPOSIT_CONTRACT)).toBe(true);
    expect(isValidAddress(data.owner)).toBe(true);
    expect(isValidAddress(data.depositor)).toBe(true);
    expect(isValidAddress(data.pendingOwner)).toBe(true);
  });
});
