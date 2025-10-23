export const WithdrawalQueueAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_pool',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_dashboard',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_vaultHub',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_steth',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_lazyOracle',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_maxAcceptableWQFinalizationTimeInSeconds',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_minWithdrawalDelayTimeInSeconds',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'DASHBOARD',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IDashboard',
      },
    ],
    stateMutability: 'view',
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
    name: 'E27_PRECISION_BASE',
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
    name: 'E36_PRECISION_BASE',
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
    name: 'FINALIZE_ROLE',
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
    name: 'LAZY_ORACLE',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ILazyOracle',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS',
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
    name: 'MAX_WITHDRAWAL_AMOUNT',
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
    name: 'MIN_WITHDRAWAL_AMOUNT',
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
    name: 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
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
    name: 'PAUSE_ROLE',
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
    name: 'RESUME_ROLE',
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
    name: 'STAKING_VAULT',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IStakingVault',
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
        internalType: 'contract IStETH',
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
    name: 'WRAPPER',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IWrapper',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'activateEmergencyExit',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'calculateCurrentStethShareRate',
    inputs: [],
    outputs: [
      {
        name: 'stethShareRate',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateCurrentStvRate',
    inputs: [],
    outputs: [
      {
        name: 'stvRate',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimWithdrawal',
    inputs: [
      {
        name: '_requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_requestor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'claimedEth',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimWithdrawals',
    inputs: [
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_hints',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_requestor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'claimedAmounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'finalize',
    inputs: [
      {
        name: '_maxRequests',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'finalizedRequests',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'findCheckpointHints',
    inputs: [
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_firstIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_lastIndex',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'hintIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getClaimableEther',
    inputs: [
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_hints',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: 'claimableEthValues',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getClaimableEther',
    inputs: [
      {
        name: '_requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'claimableEth',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLastCheckpointIndex',
    inputs: [],
    outputs: [
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLastFinalizedRequestId',
    inputs: [],
    outputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLastRequestId',
    inputs: [],
    outputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleAdmin',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
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
    name: 'getRoleMember',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'getRoleMemberCount',
    inputs: [
      {
        name: 'role',
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
    type: 'function',
    name: 'getRoleMembers',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawalRequests',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_start',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_end',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawalRequests',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawalRequestsLength',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'length',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawalStatus',
    inputs: [
      {
        name: '_requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'status',
        type: 'tuple',
        internalType: 'struct WithdrawalQueue.WithdrawalRequestStatus',
        components: [
          {
            name: 'amountOfStv',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOfStethShares',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOfAssets',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'isFinalized',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isClaimed',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawalsStatus',
    inputs: [
      {
        name: '_requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: 'statuses',
        type: 'tuple[]',
        internalType: 'struct WithdrawalQueue.WithdrawalRequestStatus[]',
        components: [
          {
            name: 'amountOfStv',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOfStethShares',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amountOfAssets',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'owner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'isFinalized',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'isClaimed',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_admin',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_finalizeRoleHolder',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isEmergencyExitActivated',
    inputs: [],
    outputs: [
      {
        name: 'isActivate',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isWithdrawalQueueStuck',
    inputs: [],
    outputs: [
      {
        name: 'isStuck',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'callerConfirmation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestWithdrawal',
    inputs: [
      {
        name: '_stvToWithdraw',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_stethSharesToRebalance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestWithdrawals',
    inputs: [
      {
        name: '_stvToWithdraw',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_stethSharesToRebalance',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'requestIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'resume',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unfinalizedAssets',
    inputs: [],
    outputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unfinalizedRequestNumber',
    inputs: [],
    outputs: [
      {
        name: 'requestNumber',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'unfinalizedStv',
    inputs: [],
    outputs: [
      {
        name: 'stv',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'EmergencyExitActivated',
    inputs: [
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ImplementationUpgraded',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'previousAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'newAdminRole',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      {
        name: 'role',
        type: 'bytes32',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        name: 'account',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WithdrawalClaimed',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'receiver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amountOfETH',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WithdrawalRequested',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amountOfStv',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOfStethShares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'amountOfAssets',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WithdrawalsFinalized',
    inputs: [
      {
        name: 'from',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'to',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'ethLocked',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'stvBurned',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'stvRebalanced',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'stethSharesRebalanced',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'neededRole',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
  {
    type: 'error',
    name: 'ArraysLengthMismatch',
    inputs: [
      {
        name: 'firstArrayLength',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'secondArrayLength',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'CantSendValueRecipientMayHaveReverted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EnforcedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExpectedPause',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidEmergencyExitActivation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidHint',
    inputs: [
      {
        name: 'hint',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidRange',
    inputs: [
      {
        name: 'start',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'end',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidRequestId',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'NoRequestsToFinalize',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotOwner',
    inputs: [
      {
        name: '_requestor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OnlyStvStrategyPoolan',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RequestAlreadyClaimed',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'RequestAmountTooLarge',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'RequestAmountTooSmall',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'RequestIdsNotSorted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RequestNotFoundOrNotFinalized',
    inputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'VaultReportStale',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
] as const;
