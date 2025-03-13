export const VaultFactoryAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_beacon',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_delegationImpl',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'CloneArgumentsTooLong',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedDeployment',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'argument',
        type: 'string',
      },
    ],
    name: 'ZeroArgument',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'delegation',
        type: 'address',
      },
    ],
    name: 'DelegationCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BEACON',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DELEGATION_IMPL',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'defaultAdmin',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'assetRecoverer',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'confirmExpiry',
            type: 'uint256',
          },
          {
            internalType: 'uint16',
            name: 'curatorFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'nodeOperatorFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'address[]',
            name: 'funders',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'withdrawers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'minters',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'burners',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'rebalancers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'depositPausers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'depositResumers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'validatorExitRequesters',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'validatorWithdrawalTriggerers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'disconnecters',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'curatorFeeSetters',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'curatorFeeClaimers',
            type: 'address[]',
          },
          {
            internalType: 'address[]',
            name: 'nodeOperatorFeeClaimers',
            type: 'address[]',
          },
        ],
        internalType: 'struct DelegationConfig',
        name: '_delegationConfig',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: '_stakingVaultInitializerExtraParams',
        type: 'bytes',
      },
    ],
    name: 'createVaultWithDelegation',
    outputs: [
      {
        internalType: 'contract IStakingVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'contract Delegation',
        name: 'delegation',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
