export const DashboardFactoryAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_lidoLocator',
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
        name: 'argName',
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
    inputs: [
      {
        internalType: 'contract IStakingVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_defaultAdmin',
        type: 'address',
      },
    ],
    name: 'createDashboard',
    outputs: [
      {
        internalType: 'contract Dashboard',
        name: 'dashboard',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
