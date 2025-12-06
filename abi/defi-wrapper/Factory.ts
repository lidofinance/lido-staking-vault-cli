export const FactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_locatorAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_subFactories',
        type: 'tuple',
        internalType: 'struct Factory.SubFactories',
        components: [
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
            name: 'withdrawalQueueFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'distributorFactory',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'ggvStrategyFactory',
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
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DEPLOY_FINISHED',
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
    name: 'DEPLOY_START_FINISH_SPAN_SECONDS',
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
    name: 'DISTRIBUTOR_FACTORY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract DistributorFactory',
      },
    ],
    stateMutability: 'view',
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
    name: 'STRATEGY_POOL_TYPE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
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
    name: 'STV_POOL_TYPE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
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
    name: 'STV_STETH_POOL_TYPE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
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
    name: 'TOTAL_BASIS_POINTS',
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
    name: 'VAULT_HUB',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IVaultHub',
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
    name: '_hashDeploymentConfiguration',
    inputs: [
      {
        name: '_sender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_auxiliaryConfig',
        type: 'tuple',
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          {
            name: 'allowlistEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'mintingEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'reserveRatioGapBP',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_strategyFactory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_strategyDeployBytes',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: '_intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'createPoolFinish',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_auxiliaryConfig',
        type: 'tuple',
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          {
            name: 'allowlistEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'mintingEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'reserveRatioGapBP',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_strategyFactory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_strategyDeployBytes',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: '_intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'deployment',
        type: 'tuple',
        internalType: 'struct Factory.PoolDeployment',
        components: [
          {
            name: 'poolType',
            type: 'bytes32',
            internalType: 'bytes32',
          },
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
            name: 'pool',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueue',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'distributor',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'strategy',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createPoolGGVStart',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_reserveRatioGapBP',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createPoolStart',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_auxiliaryConfig',
        type: 'tuple',
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          {
            name: 'allowlistEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'mintingEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'reserveRatioGapBP',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_strategyFactory',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_strategyDeployBytes',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createPoolStvStETHStart',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_allowListEnabled',
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
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'createPoolStvStart',
    inputs: [
      {
        name: '_vaultConfig',
        type: 'tuple',
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_timelockConfig',
        type: 'tuple',
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: '_commonPoolConfig',
        type: 'tuple',
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: '_allowListEnabled',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'intermediate',
        type: 'tuple',
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'derivePoolType',
    inputs: [
      {
        name: '_auxiliaryConfig',
        type: 'tuple',
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          {
            name: 'allowlistEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'mintingEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'reserveRatioGapBP',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: '_strategyFactory',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'poolType',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'intermediateState',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
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
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      {
        name: 'vault',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'pool',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'poolType',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'withdrawalQueue',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'strategyFactory',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'strategyDeployBytes',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
      {
        name: 'strategy',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PoolCreationStarted',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'vaultConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Factory.VaultConfig',
        components: [
          {
            name: 'nodeOperator',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorManager',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'confirmExpiry',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'commonPoolConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Factory.CommonPoolConfig',
        components: [
          {
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
        ],
      },
      {
        name: 'auxiliaryConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        components: [
          {
            name: 'allowlistEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'mintingEnabled',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'reserveRatioGapBP',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'timelockConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Factory.TimelockConfig',
        components: [
          {
            name: 'minDelaySeconds',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'proposer',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'executor',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: 'strategyFactory',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'strategyDeployBytes',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
      {
        name: 'intermediate',
        type: 'tuple',
        indexed: false,
        internalType: 'struct Factory.PoolIntermediate',
        components: [
          {
            name: 'dashboard',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'poolProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'withdrawalQueueProxy',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
      {
        name: 'finishDeadline',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'InsufficientConnectDeposit',
    inputs: [
      {
        name: 'provided',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidConfiguration',
    inputs: [
      {
        name: 'reason',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
  {
    type: 'error',
    name: 'StringTooLong',
    inputs: [
      {
        name: 'str',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
] as const;
