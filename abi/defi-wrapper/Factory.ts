export const FactoryAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_locatorAddress', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'stvPoolFactory', type: 'address' },
          {
            internalType: 'address',
            name: 'stvStETHPoolFactory',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'withdrawalQueueFactory',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'distributorFactory',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'ggvStrategyFactory',
            type: 'address',
          },
          { internalType: 'address', name: 'timelockFactory', type: 'address' },
        ],
        internalType: 'struct Factory.SubFactories',
        name: '_subFactories',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'provided', type: 'uint256' },
      { internalType: 'uint256', name: 'required', type: 'uint256' },
    ],
    name: 'InsufficientConnectDeposit',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'string', name: 'reason', type: 'string' }],
    name: 'InvalidConfiguration',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'string', name: 'str', type: 'string' }],
    name: 'StringTooLong',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'string', name: 'str', type: 'string' }],
    name: 'StringTooLong',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'poolType',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'withdrawalQueue',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'strategyFactory',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'strategyDeployBytes',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'strategy',
        type: 'address',
      },
    ],
    name: 'PoolCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        indexed: false,
        internalType: 'struct Factory.VaultConfig',
        name: 'vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct Factory.CommonPoolConfig',
        name: 'commonPoolConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bool', name: 'allowlistEnabled', type: 'bool' },
          { internalType: 'bool', name: 'mintingEnabled', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'reserveRatioGapBP',
            type: 'uint256',
          },
        ],
        indexed: false,
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        name: 'auxiliaryConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        indexed: false,
        internalType: 'struct Factory.TimelockConfig',
        name: 'timelockConfig',
        type: 'tuple',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'strategyFactory',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'strategyDeployBytes',
        type: 'bytes',
      },
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        indexed: false,
        internalType: 'struct Factory.PoolIntermediate',
        name: 'intermediate',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finishDeadline',
        type: 'uint256',
      },
    ],
    name: 'PoolCreationStarted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEPLOY_FINISHED',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEPLOY_START_FINISH_SPAN_SECONDS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DISTRIBUTOR_FACTORY',
    outputs: [
      {
        internalType: 'contract DistributorFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DUMMY_IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GGV_STRATEGY_FACTORY',
    outputs: [
      {
        internalType: 'contract GGVStrategyFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LAZY_ORACLE',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STETH',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STRATEGY_POOL_TYPE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STV_POOL_FACTORY',
    outputs: [
      { internalType: 'contract StvPoolFactory', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STV_POOL_TYPE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STV_STETH_POOL_FACTORY',
    outputs: [
      {
        internalType: 'contract StvStETHPoolFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STV_STETH_POOL_TYPE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TIMELOCK_FACTORY',
    outputs: [
      { internalType: 'contract TimelockFactory', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TOTAL_BASIS_POINTS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VAULT_FACTORY',
    outputs: [
      { internalType: 'contract IVaultFactory', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VAULT_HUB',
    outputs: [
      { internalType: 'contract IVaultHub', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WITHDRAWAL_QUEUE_FACTORY',
    outputs: [
      {
        internalType: 'contract WithdrawalQueueFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WSTETH',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_sender', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        internalType: 'struct Factory.VaultConfig',
        name: '_vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        internalType: 'struct Factory.CommonPoolConfig',
        name: '_commonPoolConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bool', name: 'allowlistEnabled', type: 'bool' },
          { internalType: 'bool', name: 'mintingEnabled', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'reserveRatioGapBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        name: '_auxiliaryConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        internalType: 'struct Factory.TimelockConfig',
        name: '_timelockConfig',
        type: 'tuple',
      },
      { internalType: 'address', name: '_strategyFactory', type: 'address' },
      { internalType: 'bytes', name: '_strategyDeployBytes', type: 'bytes' },
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        internalType: 'struct Factory.PoolIntermediate',
        name: '_intermediate',
        type: 'tuple',
      },
    ],
    name: '_hashDeploymentConfiguration',
    outputs: [{ internalType: 'bytes32', name: 'result', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        internalType: 'struct Factory.VaultConfig',
        name: '_vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        internalType: 'struct Factory.TimelockConfig',
        name: '_timelockConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        internalType: 'struct Factory.CommonPoolConfig',
        name: '_commonPoolConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bool', name: 'allowlistEnabled', type: 'bool' },
          { internalType: 'bool', name: 'mintingEnabled', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'reserveRatioGapBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        name: '_auxiliaryConfig',
        type: 'tuple',
      },
      { internalType: 'address', name: '_strategyFactory', type: 'address' },
      { internalType: 'bytes', name: '_strategyDeployBytes', type: 'bytes' },
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        internalType: 'struct Factory.PoolIntermediate',
        name: '_intermediate',
        type: 'tuple',
      },
    ],
    name: 'createPoolFinish',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'poolType', type: 'bytes32' },
          { internalType: 'address', name: 'vault', type: 'address' },
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'pool', type: 'address' },
          { internalType: 'address', name: 'withdrawalQueue', type: 'address' },
          { internalType: 'address', name: 'distributor', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
          { internalType: 'address', name: 'strategy', type: 'address' },
        ],
        internalType: 'struct Factory.PoolDeployment',
        name: 'deployment',
        type: 'tuple',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        internalType: 'struct Factory.VaultConfig',
        name: '_vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        internalType: 'struct Factory.TimelockConfig',
        name: '_timelockConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        internalType: 'struct Factory.CommonPoolConfig',
        name: '_commonPoolConfig',
        type: 'tuple',
      },
      { internalType: 'uint256', name: '_reserveRatioGapBP', type: 'uint256' },
    ],
    name: 'createPoolGGVStart',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        internalType: 'struct Factory.PoolIntermediate',
        name: 'intermediate',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        internalType: 'struct Factory.VaultConfig',
        name: '_vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        internalType: 'struct Factory.TimelockConfig',
        name: '_timelockConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        internalType: 'struct Factory.CommonPoolConfig',
        name: '_commonPoolConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'bool', name: 'allowlistEnabled', type: 'bool' },
          { internalType: 'bool', name: 'mintingEnabled', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'reserveRatioGapBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        name: '_auxiliaryConfig',
        type: 'tuple',
      },
      { internalType: 'address', name: '_strategyFactory', type: 'address' },
      { internalType: 'bytes', name: '_strategyDeployBytes', type: 'bytes' },
    ],
    name: 'createPoolStart',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        internalType: 'struct Factory.PoolIntermediate',
        name: 'intermediate',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        internalType: 'struct Factory.VaultConfig',
        name: '_vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        internalType: 'struct Factory.TimelockConfig',
        name: '_timelockConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        internalType: 'struct Factory.CommonPoolConfig',
        name: '_commonPoolConfig',
        type: 'tuple',
      },
      { internalType: 'bool', name: '_allowListEnabled', type: 'bool' },
      { internalType: 'uint256', name: '_reserveRatioGapBP', type: 'uint256' },
    ],
    name: 'createPoolStvStETHStart',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        internalType: 'struct Factory.PoolIntermediate',
        name: 'intermediate',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'nodeOperator', type: 'address' },
          {
            internalType: 'address',
            name: 'nodeOperatorManager',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFeeBP',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'confirmExpiry', type: 'uint256' },
        ],
        internalType: 'struct Factory.VaultConfig',
        name: '_vaultConfig',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'minDelaySeconds', type: 'uint256' },
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'executor', type: 'address' },
        ],
        internalType: 'struct Factory.TimelockConfig',
        name: '_timelockConfig',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'minWithdrawalDelayTime',
            type: 'uint256',
          },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          {
            internalType: 'address',
            name: 'emergencyCommittee',
            type: 'address',
          },
        ],
        internalType: 'struct Factory.CommonPoolConfig',
        name: '_commonPoolConfig',
        type: 'tuple',
      },
      { internalType: 'bool', name: '_allowListEnabled', type: 'bool' },
    ],
    name: 'createPoolStvStart',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'dashboard', type: 'address' },
          { internalType: 'address', name: 'poolProxy', type: 'address' },
          { internalType: 'address', name: 'poolImpl', type: 'address' },
          {
            internalType: 'address',
            name: 'withdrawalQueueProxy',
            type: 'address',
          },
          { internalType: 'address', name: 'wqImpl', type: 'address' },
          { internalType: 'address', name: 'timelock', type: 'address' },
        ],
        internalType: 'struct Factory.PoolIntermediate',
        name: 'intermediate',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'bool', name: 'allowlistEnabled', type: 'bool' },
          { internalType: 'bool', name: 'mintingEnabled', type: 'bool' },
          {
            internalType: 'uint256',
            name: 'reserveRatioGapBP',
            type: 'uint256',
          },
        ],
        internalType: 'struct Factory.AuxiliaryPoolConfig',
        name: '_auxiliaryConfig',
        type: 'tuple',
      },
      { internalType: 'address', name: '_strategyFactory', type: 'address' },
    ],
    name: 'derivePoolType',
    outputs: [{ internalType: 'bytes32', name: 'poolType', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'intermediateState',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
