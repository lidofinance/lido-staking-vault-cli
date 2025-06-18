export const VaultViewerAbi = [
  {
    inputs: [
      {
        internalType: 'address payable',
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
        internalType: 'address',
        name: 'vaultAddress',
        type: 'address',
      },
      {
        internalType: 'bytes32[]',
        name: 'roles',
        type: 'bytes32[]',
      },
    ],
    name: 'getRoleMembers',
    outputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'nodeOperator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'depositor',
        type: 'address',
      },
      {
        internalType: 'address[][]',
        name: 'members',
        type: 'address[][]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'vaultAddresses',
        type: 'address[]',
      },
      {
        internalType: 'bytes32[]',
        name: 'roles',
        type: 'bytes32[]',
      },
    ],
    name: 'getRoleMembersBatch',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vault',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'nodeOperator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'depositor',
            type: 'address',
          },
          {
            internalType: 'address[][]',
            name: 'members',
            type: 'address[][]',
          },
        ],
        internalType: 'struct VaultViewer.VaultRoleMembers[]',
        name: 'result',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'vault',
        type: 'address',
      },
    ],
    name: 'getVaultData',
    outputs: [
      {
        components: [
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
            name: 'connection',
            type: 'tuple',
          },
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
            name: 'record',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'totalValue',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liabilityStETH',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFee',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isOwnerDashboard',
            type: 'bool',
          },
        ],
        internalType: 'struct VaultViewer.VaultData',
        name: 'data',
        type: 'tuple',
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
    name: 'getVaultsDataBound',
    outputs: [
      {
        components: [
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
            name: 'connection',
            type: 'tuple',
          },
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
            name: 'record',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'totalValue',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'liabilityStETH',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nodeOperatorFee',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isOwnerDashboard',
            type: 'bool',
          },
        ],
        internalType: 'struct VaultViewer.VaultData[]',
        name: 'vaultsData',
        type: 'tuple[]',
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
        internalType: 'contract IStakingVault',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'vaultState',
    outputs: [
      {
        internalType: 'enum VaultViewer.VaultState',
        name: '',
        type: 'uint8',
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
