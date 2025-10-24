export const FactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'poolConfig',
        type: 'tuple',
        internalType: 'struct Factory.WrapperConfig',
        components: [
          {
            name: 'vaultFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'steth',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'wsteth',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'lazyOracle',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'stvPoolFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'stvStETHPoolFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'stvStrategyPoolFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'loopStrategyFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ggvStrategyFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'dummyImplementation',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelockFactory',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: 'timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'DUMMY_IMPLEMENTATION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'GGV_STRATEGY_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract GGVStrategyFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'LAZY_ORACLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'LOOP_STRATEGY_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract LoopStrategyFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'STETH',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'STV_POOL_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract StvPoolFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'STV_STETH_POOL_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract StvStETHPoolFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'STV_STRATEGY_POOL_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract StvStrategyPoolFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TIMELOCK_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract TimelockFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TIMELOCK_MIN_DELAY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'VAULT_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IVaultFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WITHDRAWAL_QUEUE_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract WithdrawalQueueFactory',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WSTETH',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'createVaultWithConfiguredWrapper',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_configuration',
        type: 'uint8',
        internalType: 'enum Factory.WrapperType',
      },
      {
        name: '_strategy',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_timelockExecutor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithGGVStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_teller',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_boringQueue',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_timelockExecutor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithGGVStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_teller',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_boringQueue',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithLoopStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_loops',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithLoopStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_loops',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_timelockExecutor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithMintingNoStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithMintingNoStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_timelockExecutor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithNoMintingNoStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createVaultWithNoMintingNoStrategy',
    inputs: [
      {
        name: '_nodeOperator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorManager',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_confirmExpiry',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxFinalizationTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_allowlistEnabled',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: '_timelockExecutor',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'poolProxy',
        type: 'address',
        internalType: 'address payable',
      },
      {
        name: 'withdrawalQueueProxy',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'VaultWrapperCreated',
    inputs: [
      {
        name: 'vault',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'pool',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'withdrawalQueue',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'strategy',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'configuration',
        type: 'uint8',
        indexed: false,
        internalType: 'enum Factory.WrapperType',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'InvalidConfiguration',
    inputs: [],
  },
] as const;
