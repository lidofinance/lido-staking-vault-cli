import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
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
  beaconChainDepositsPaused: {
    name: 'is-paused-deposits',
    description: 'get whether deposits are paused by the vault owner',
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
    name: 'DEPOSIT_CONTRACT',
    description: 'get vault deposit contract',
  },
  owner: {
    name: 'owner',
    description: 'get vault owner',
  },
  version: {
    name: 'version',
    description: 'get vault version',
  },
  initializedVersion: {
    name: 'i-version',
    description: 'get vault initialized version',
  },
  depositor: {
    name: 'depositor',
    description: 'get the address of the depositor',
  },
};
