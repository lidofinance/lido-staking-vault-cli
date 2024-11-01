export const VaultHubAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "int256",
        name: "reserveRatio",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "minReserveRatio",
        type: "uint256",
      },
    ],
    name: "AlreadyBalanced",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "AlreadyConnected",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "capShares",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxCapShares",
        type: "uint256",
      },
    ],
    name: "CapTooHigh",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "capVaultBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxExternalBalance",
        type: "uint256",
      },
    ],
    name: "ExternalBalanceCapReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "int256",
        name: "reserveRatio",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "minReserveRatio",
        type: "uint256",
      },
    ],
    name: "MinReserveRatioReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "capShares",
        type: "uint256",
      },
    ],
    name: "MintCapReached",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "operation",
        type: "string",
      },
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "NotAuthorized",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    name: "NotConnectedToHub",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "shouldBe",
        type: "uint256",
      },
    ],
    name: "NotEnoughBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "NotEnoughShares",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    name: "RebalanceFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "reserveRatioBP",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxReserveRatioBP",
        type: "uint256",
      },
    ],
    name: "ReserveRatioTooHigh",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    name: "StETHMintFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "TooManyVaults",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "treasuryFeeBP",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxTreasuryFeeBP",
        type: "uint256",
      },
    ],
    name: "TreasuryFeeTooHigh",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "argument",
        type: "string",
      },
    ],
    name: "ZeroArgument",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOfTokens",
        type: "uint256",
      },
    ],
    name: "BurnedStETHOnVault",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOfTokens",
        type: "uint256",
      },
    ],
    name: "MintedStETHOnVault",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "capShares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minReserveRatioBP",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryFeeBP",
        type: "uint256",
      },
    ],
    name: "VaultConnected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    name: "VaultDisconnected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokensBurnt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "newReserveRatio",
        type: "int256",
      },
    ],
    name: "VaultRebalanced",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STETH",
    outputs: [
      {
        internalType: "contract StETH",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VAULT_MASTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amountOfTokens",
        type: "uint256",
      },
    ],
    name: "burnStethBackedByVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILockable",
        name: "_vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_capShares",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minReserveRatioBP",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_treasuryFeeBP",
        type: "uint256",
      },
    ],
    name: "connectVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "disconnectVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILockable",
        name: "_vault",
        type: "address",
      },
    ],
    name: "forceRebalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amountOfTokens",
        type: "uint256",
      },
    ],
    name: "mintStethBackedByVault",
    outputs: [
      {
        internalType: "uint256",
        name: "totalEtherToLock",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "rebalance",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILockable",
        name: "_vault",
        type: "address",
      },
    ],
    name: "reserveRatio",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "vault",
    outputs: [
      {
        internalType: "contract ILockable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "vaultSocket",
    outputs: [
      {
        components: [
          {
            internalType: "contract ILockable",
            name: "vault",
            type: "address",
          },
          {
            internalType: "uint96",
            name: "capShares",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "mintedShares",
            type: "uint96",
          },
          {
            internalType: "uint16",
            name: "minReserveRatioBP",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "treasuryFeeBP",
            type: "uint16",
          },
        ],
        internalType: "struct VaultHub.VaultSocket",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract ILockable",
        name: "_vault",
        type: "address",
      },
    ],
    name: "vaultSocket",
    outputs: [
      {
        components: [
          {
            internalType: "contract ILockable",
            name: "vault",
            type: "address",
          },
          {
            internalType: "uint96",
            name: "capShares",
            type: "uint96",
          },
          {
            internalType: "uint96",
            name: "mintedShares",
            type: "uint96",
          },
          {
            internalType: "uint16",
            name: "minReserveRatioBP",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "treasuryFeeBP",
            type: "uint16",
          },
        ],
        internalType: "struct VaultHub.VaultSocket",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
