export const VaultViewerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vaultHubAddress',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'WrongPaginationRange',
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
    inputs: [
      {
        internalType: 'contract IVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_member',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_role',
        type: 'bytes32',
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
        name: 'account',
        type: 'address',
      },
    ],
    name: 'isContract',
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
        internalType: 'contract IVault',
        name: 'vault',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'isOwner',
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
    inputs: [],
    name: 'vaultHub',
    outputs: [
      {
        internalType: 'contract VaultHub',
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
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'vaultsByOwner',
    outputs: [
      {
        internalType: 'contract IVault[]',
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
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'vaultsByOwnerBound',
    outputs: [
      {
        internalType: 'contract IVault[]',
        name: '',
        type: 'address[]',
      },
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
        name: '_role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_member',
        type: 'address',
      },
    ],
    name: 'vaultsByRole',
    outputs: [
      {
        internalType: 'contract IVault[]',
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
        name: '_role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_member',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'vaultsByRoleBound',
    outputs: [
      {
        internalType: 'contract IVault[]',
        name: '',
        type: 'address[]',
      },
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
    name: 'vaultsConnected',
    outputs: [
      {
        internalType: 'contract IVault[]',
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
        internalType: 'uint256',
        name: '_from',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_to',
        type: 'uint256',
      },
    ],
    name: 'vaultsConnectedBound',
    outputs: [
      {
        internalType: 'contract IVault[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
