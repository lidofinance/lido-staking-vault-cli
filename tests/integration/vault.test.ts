import { describe, test, expect, beforeAll } from 'vitest';
import { type Address } from 'viem';
import { getVaultBaseInfo } from 'features';
import { loadTestConfig } from './helpers/test-config.js';
import {
  captureLogResult,
  isValidAddress,
  isValidBytes32,
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
  balance: '1.01 ETH',
  availableBalance: '1.01 ETH',
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

    // Validate required fields exist
    expect(data.DEPOSIT_CONTRACT).toBeDefined();
    expect(isValidAddress(data.DEPOSIT_CONTRACT)).toBe(true);
    expect(data.DEPOSIT_CONTRACT).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.DEPOSIT_CONTRACT,
    );

    expect(data.CONTRACT_ADDRESS).toBeDefined();
    expect(isValidAddress(data.CONTRACT_ADDRESS)).toBe(true);
    expect(data.CONTRACT_ADDRESS).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.CONTRACT_ADDRESS,
    );

    expect(data.owner).toBeDefined();
    expect(isValidAddress(data.owner)).toBe(true);
    expect(data.owner).toBe(EXPECTED_BASE_INFO_DATA_HOODI.owner);

    expect(data.pendingOwner).toBeDefined();
    expect(isValidAddress(data.pendingOwner)).toBe(true);
    expect(data.pendingOwner).toBe(EXPECTED_BASE_INFO_DATA_HOODI.pendingOwner);

    expect(data.depositor).toBeDefined();
    expect(isValidAddress(data.depositor)).toBe(true);
    expect(data.depositor).toBe(EXPECTED_BASE_INFO_DATA_HOODI.depositor);

    expect(data.nodeOperator).toBeDefined();
    expect(isValidAddress(data.nodeOperator)).toBe(true);
    expect(data.nodeOperator).toBe(EXPECTED_BASE_INFO_DATA_HOODI.nodeOperator);

    expect(data.beaconChainDepositsPaused).toBeDefined();
    expect(data.beaconChainDepositsPaused).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.beaconChainDepositsPaused,
    );

    expect(data.initializedVersion).toBeDefined();
    expect(data.initializedVersion).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.initializedVersion,
    );

    expect(data.version).toBeDefined();
    expect(data.version).toBe(EXPECTED_BASE_INFO_DATA_HOODI.version);

    expect(data.balance).toBeDefined();
    expect(data.balance).toBe(EXPECTED_BASE_INFO_DATA_HOODI.balance);

    expect(data.availableBalance).toBeDefined();
    expect(data.availableBalance).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.availableBalance,
    );

    expect(data.stagedBalance).toBeDefined();
    expect(data.stagedBalance).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.stagedBalance,
    );

    expect(data.isOwnerContract).toBeDefined();
    expect(data.isOwnerContract).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.isOwnerContract,
    );

    expect(data.withdrawalCredentials).toBeDefined();
    expect(isValidBytes32(data.withdrawalCredentials)).toBe(true);
    expect(data.withdrawalCredentials).toBe(
      EXPECTED_BASE_INFO_DATA_HOODI.withdrawalCredentials,
    );
  });
});
