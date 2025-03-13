import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  latestReport: {
    name: 'l-report',
    description: 'get latest vault report',
  },
  calculateValidatorWithdrawalFee: {
    name: 'validator-w-fee',
    description: 'get calculated withdrawal fee for a validator',
    arguments: {
      _numberOfKeys: {
        name: 'numberOfKeys',
        description: 'number of validators public keys',
        modifier: (value: string) => BigInt(value),
      },
    },
  },
  inOutDelta: {
    name: 'delta',
    description: 'get the net difference between deposits and withdrawals',
  },
  beaconChainDepositsPaused: {
    name: 'is-paused',
    description: 'get whether deposits are paused by the vault owner',
  },
  valuation: {
    name: 'valuation',
    description: 'get vault valuation',
  },
  unlocked: {
    name: 'unlocked',
    description: 'get vault unlocked',
  },
  locked: {
    name: 'locked',
    description: 'get vault locked',
  },
  withdrawalCredentials: {
    name: 'wc',
    description: 'get vault withdrawal credentials',
  },
  nodeOperator: {
    name: 'no',
    description: 'get vault node operator',
  },
  DEPOSIT_CONTRACT: {
    name: 'deposit-contract',
    description: 'get vault deposit contract',
  },
  owner: {
    name: 'owner',
    description: 'get vault owner',
  },
  vaultHub: {
    name: 'vault-hub',
    description: 'get vault hub',
  },
  version: {
    name: 'version',
    description: 'get vault version',
  },
  initializedVersion: {
    name: 'i-version',
    description: 'get vault initialized version',
  },
};
