import { OperatorGridErrorsAbi } from './OperatorGrid.js';
import { VaultHubErrorsAbi } from './VaultHub.js';
import { DashboardErrorsAbi } from './Dashboard.js';
import { StakingVaultErrorsAbi } from './StakingVault.js';

export const VaultFactoryAbi = [
  ...VaultHubErrorsAbi,
  ...OperatorGridErrorsAbi,
  ...DashboardErrorsAbi,
  ...StakingVaultErrorsAbi,
  {
    inputs: [
      {
        internalType: 'address',
        name: '_lidoLocator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_beacon',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_dashboardImpl',
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
    inputs: [],
    name: 'InsufficientFunds',
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
        name: 'dashboard',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'admin',
        type: 'address',
      },
    ],
    name: 'DashboardCreated',
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
    name: 'DASHBOARD_IMPL',
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
    name: 'LIDO_LOCATOR',
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
        name: '_defaultAdmin',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nodeOperatorManager',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_confirmExpiry',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
        ],
        internalType: 'struct Permissions.RoleAssignment[]',
        name: '_roleAssignments',
        type: 'tuple[]',
      },
    ],
    name: 'createVaultWithDashboard',
    outputs: [
      {
        internalType: 'contract IStakingVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'contract Dashboard',
        name: 'dashboard',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_defaultAdmin',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nodeOperator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_nodeOperatorManager',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_nodeOperatorFeeBP',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_confirmExpiry',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'role',
            type: 'bytes32',
          },
        ],
        internalType: 'struct Permissions.RoleAssignment[]',
        name: '_roleAssignments',
        type: 'tuple[]',
      },
    ],
    name: 'createVaultWithDashboardWithoutConnectingToVaultHub',
    outputs: [
      {
        internalType: 'contract IStakingVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'contract Dashboard',
        name: 'dashboard',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;
