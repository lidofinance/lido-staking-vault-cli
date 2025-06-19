import { ReadProgramCommandConfig } from 'utils';
import { OperatorGridAbi } from 'abi';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof OperatorGridAbi
> = {
  MAX_CONFIRM_EXPIRY: {
    name: 'max-confirm-expiry',
    description: 'get max confirm expiry',
  },
  MIN_CONFIRM_EXPIRY: {
    name: 'min-confirm-expiry',
    description: 'get min confirm expiry',
  },
  group: {
    name: 'group',
    description: 'get group by node operator address',
    arguments: {
      _nodeOperator: {
        name: 'node-operator',
        description: 'node operator address',
      },
    },
  },
  nodeOperatorAddress: {
    name: 'node-operator-address',
    description: 'get node operator address by index',
    arguments: {
      _index: {
        name: 'index',
        description: 'index',
      },
    },
  },
  nodeOperatorCount: {
    name: 'node-operator-count',
    description: 'get node operator count',
  },
  tier: {
    name: 'tier',
    description: 'get tier by ID',
    arguments: {
      _tierId: {
        name: 'id',
        description: 'tier id',
      },
    },
  },
  vaultInfo: {
    name: 'vault-info',
    description: 'get vault limits',
    arguments: {
      vaultAddr: {
        name: 'vault-address',
        description: 'vault address',
      },
    },
  },
  tiersCount: {
    name: 'tiers-count',
    description: 'get a tiers count',
  },
  confirmation: {
    name: 'confirmation',
    description: 'get confirmation by role and call data',
    arguments: {
      _role: {
        name: 'role',
        description: 'role',
      },
      _callData: {
        name: 'call-data',
        description: 'call data',
      },
    },
  },
  effectiveShareLimit: {
    name: 'effective-share-limit',
    description:
      'get the effective share limit of a vault according to the OperatorGrid and vault share limits',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  getConfirmExpiry: {
    name: 'get-confirm-expiry',
    description: 'get confirm expiry',
  },
};
