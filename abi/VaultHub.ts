import { StakingVaultErrorsAbi } from './StakingVault.js';

export const VaultHubErrorsAbi = [
  {
    inputs: [],
    name: 'AccessControlBadConfirmation',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'neededRole',
        type: 'bytes32',
      },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'AlreadyConnected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'AlreadyHealthy',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'codehash',
        type: 'bytes32',
      },
    ],
    name: 'CodehashNotAllowed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxForcedRebalanceThresholdBP',
        type: 'uint256',
      },
    ],
    name: 'ForcedRebalanceThresholdTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxInfraFeeBP',
        type: 'uint256',
      },
    ],
    name: 'InfraFeeTooHigh',
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
        name: 'expectedBalance',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'InsufficientSharesToBurn',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalValue',
        type: 'uint256',
      },
    ],
    name: 'InsufficientTotalValueToMint',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'unlocked',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expectedUnlocked',
        type: 'uint256',
      },
    ],
    name: 'InsufficientUnlocked',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'newFees',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'oldFees',
        type: 'uint256',
      },
    ],
    name: 'InvalidFees',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInitialization',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxLiquidityFeeBP',
        type: 'uint256',
      },
    ],
    name: 'LiquidityFeeTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxRelativeShareLimitBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalBasisPoints',
        type: 'uint256',
      },
    ],
    name: 'MaxRelativeShareLimitBPTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'liabilityShares',
        type: 'uint256',
      },
    ],
    name: 'NoLiabilitySharesShouldBeLeft',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAuthorized',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'NotConnectedToHub',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializing',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'PDGNotDepositor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PartialValidatorWithdrawalNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PauseUntilMustBeInFuture',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PausedExpected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'totalValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'rebalanceAmount',
        type: 'uint256',
      },
    ],
    name: 'RebalanceAmountExceedsTotalValue',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxReservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'ReservationFeeTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxReserveRatioBP',
        type: 'uint256',
      },
    ],
    name: 'ReserveRatioTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ResumedExpected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
    ],
    name: 'ShareLimitExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'maxShareLimit',
        type: 'uint256',
      },
    ],
    name: 'ShareLimitTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TotalValueBelowLockedAmount',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'UnhealthyVaultCannotDeposit',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultHubNotPendingOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'currentBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expectedBalance',
        type: 'uint256',
      },
    ],
    name: 'VaultInsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultIsDisconnecting',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'liabilityShares',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'newRebalanceThresholdBP',
        type: 'uint256',
      },
    ],
    name: 'VaultMintingCapacityExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultOssified',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultReportStale',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultZeroAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroArgument',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroCodehash',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroIndex',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroPauseDuration',
    type: 'error',
  },
] as const;

export const VaultHubAbi = [
  ...VaultHubErrorsAbi,
  ...StakingVaultErrorsAbi,
  {
    inputs: [
      {
        internalType: 'contract ILidoLocator',
        name: '_locator',
        type: 'address',
      },
      {
        internalType: 'contract ILido',
        name: '_lido',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_maxRelativeShareLimitBP',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'codehash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'allowed',
        type: 'bool',
      },
    ],
    name: 'AllowedCodehashUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountOfShares',
        type: 'uint256',
      },
    ],
    name: 'BurnedSharesOnVault',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'pubkeys',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'refundRecipient',
        type: 'address',
      },
    ],
    name: 'ForcedValidatorExitTriggered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint64',
        name: 'version',
        type: 'uint64',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amountOfShares',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'lockedAmount',
        type: 'uint256',
      },
    ],
    name: 'MintedSharesOnVault',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Resumed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'VaultConnected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'shareLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reserveRatioBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'VaultConnectionUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultDisconnectCompleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'VaultDisconnectInitiated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'infraFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'liquidityFeeBP',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'VaultFeesUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'int128',
        name: 'inOutDelta',
        type: 'int128',
      },
    ],
    name: 'VaultInOutDeltaUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'oldOwner',
        type: 'address',
      },
    ],
    name: 'VaultOwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'sharesBurned',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'etherWithdrawn',
        type: 'uint256',
      },
    ],
    name: 'VaultRebalanced',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reportTimestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reportTotalValue',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'reportInOutDelta',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reportFeeSharesCharged',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reportLiabilityShares',
        type: 'uint256',
      },
    ],
    name: 'VaultReportApplied',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newShareLimit',
        type: 'uint256',
      },
    ],
    name: 'VaultShareLimitUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CONNECT_DEPOSIT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LIDO',
    outputs: [
      {
        internalType: 'contract ILido',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LIDO_LOCATOR',
    outputs: [
      {
        internalType: 'contract ILidoLocator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'MAX_RELATIVE_SHARE_LIMIT_BP',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PAUSE_INFINITELY',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PAUSE_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REPORT_FRESHNESS_DELTA',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'RESUME_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VAULT_CODEHASH_SET_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VAULT_MASTER_ROLE',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint64',
        name: '_reportTimestamp',
        type: 'uint64',
      },
      {
        internalType: 'uint256',
        name: '_reportTotalValue',
        type: 'uint256',
      },
      {
        internalType: 'int256',
        name: '_reportInOutDelta',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: '_reportFeeSharesCharged',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_reportLiabilityShares',
        type: 'uint256',
      },
    ],
    name: 'applyVaultReport',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amountOfShares',
        type: 'uint256',
      },
    ],
    name: 'burnShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_pubkey',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
    ],
    name: 'compensateDisprovenPredepositFromPDG',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'connectVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'disconnect',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'forceRebalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_pubkeys',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: '_refundRecipient',
        type: 'address',
      },
    ],
    name: 'forceValidatorExit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'fund',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getResumeSinceTimestamp',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getRoleMember',
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
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleMemberCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleMembers',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_admin',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'isReportFresh',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'isVaultConnected',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'isVaultHealthy',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'latestReport',
    outputs: [
      {
        components: [
          {
            internalType: 'uint128',
            name: 'totalValue',
            type: 'uint128',
          },
          {
            internalType: 'int128',
            name: 'inOutDelta',
            type: 'int128',
          },
        ],
        internalType: 'struct VaultHub.Report',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'latestVaultReportTimestamp',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'liabilityShares',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'locked',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amountOfShares',
        type: 'uint256',
      },
    ],
    name: 'mintShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_amountOfShares',
        type: 'uint256',
      },
    ],
    name: 'mintVaultsTreasuryFeeShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'pauseBeaconChainDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
    ],
    name: 'pauseFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_pauseUntilInclusive',
        type: 'uint256',
      },
    ],
    name: 'pauseUntil',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'bytes32[]',
            name: 'proof',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'validatorIndex',
            type: 'uint256',
          },
          {
            internalType: 'uint64',
            name: 'childBlockTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'slot',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'proposerIndex',
            type: 'uint64',
          },
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness',
        name: '_witness',
        type: 'tuple',
      },
    ],
    name: 'proveUnknownValidatorToPDG',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_ether',
        type: 'uint256',
      },
    ],
    name: 'rebalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'rebalanceShortfall',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'callerConfirmation',
        type: 'address',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_pubkeys',
        type: 'bytes',
      },
    ],
    name: 'requestValidatorExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resume',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'resumeBeaconChainDeposits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_codehash',
        type: 'bytes32',
      },
      {
        internalType: 'bool',
        name: '_allowed',
        type: 'bool',
      },
    ],
    name: 'setAllowedCodehash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'totalValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amountOfShares',
        type: 'uint256',
      },
    ],
    name: 'transferAndBurnShares',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'transferVaultOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_pubkeys',
        type: 'bytes',
      },
      {
        internalType: 'uint64[]',
        name: '_amounts',
        type: 'uint64[]',
      },
      {
        internalType: 'address',
        name: '_refundRecipient',
        type: 'address',
      },
    ],
    name: 'triggerValidatorWithdrawals',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'unlocked',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_shareLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_reserveRatioBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_forcedRebalanceThresholdBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_infraFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_liquidityFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'updateConnection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_shareLimit',
        type: 'uint256',
      },
    ],
    name: 'updateShareLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_infraFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_liquidityFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_reservationFeeBP',
        type: 'uint256',
      },
    ],
    name: 'updateVaultFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
    ],
    name: 'vaultByIndex',
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
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'vaultConnection',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint96',
            name: 'shareLimit',
            type: 'uint96',
          },
          {
            internalType: 'uint96',
            name: 'vaultIndex',
            type: 'uint96',
          },
          {
            internalType: 'bool',
            name: 'pendingDisconnect',
            type: 'bool',
          },
          {
            internalType: 'uint16',
            name: 'reserveRatioBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'forcedRebalanceThresholdBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'infraFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'liquidityFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'reservationFeeBP',
            type: 'uint16',
          },
        ],
        internalType: 'struct VaultHub.VaultConnection',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'vaultRecord',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint128',
                name: 'totalValue',
                type: 'uint128',
              },
              {
                internalType: 'int128',
                name: 'inOutDelta',
                type: 'int128',
              },
            ],
            internalType: 'struct VaultHub.Report',
            name: 'report',
            type: 'tuple',
          },
          {
            internalType: 'uint128',
            name: 'locked',
            type: 'uint128',
          },
          {
            internalType: 'uint96',
            name: 'liabilityShares',
            type: 'uint96',
          },
          {
            internalType: 'uint64',
            name: 'reportTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'int128',
            name: 'inOutDelta',
            type: 'int128',
          },
          {
            internalType: 'uint96',
            name: 'feeSharesCharged',
            type: 'uint96',
          },
        ],
        internalType: 'struct VaultHub.VaultRecord',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vaultsCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'voluntaryDisconnect',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_ether',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;
