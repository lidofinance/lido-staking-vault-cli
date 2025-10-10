import { ReadProgramCommandConfig } from 'utils';
import { StakingVaultAbi } from 'abi';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof StakingVaultAbi
> = {
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
  depositor: {
    name: 'depositor',
    description: 'get the address of the depositor',
  },
  availableBalance: {
    name: 'available-balance',
    description:
      'get the balance that is available for withdrawal (does not account the balances staged for activations)',
  },
  stagedBalance: {
    name: 'staged-balance',
    description:
      'get the amount of ether on the balance that was staged by depositor for validator activations',
  },
  pendingOwner: {
    name: 'pending-owner',
    description: 'get the pending owner of the contract',
  },
};
