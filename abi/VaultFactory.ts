export const VaultFactoryAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "_stakingVaultImpl",
        type: "address"
      },
      {
        internalType: "address",
        name: "_delegationImpl",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "implementation",
        type: "address"
      }
    ],
    name: "BeaconInvalidImplementation",
    type: "error"
  },
  {
    inputs: [],
    name: "ERC1167FailedCreateClone",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "OwnableInvalidOwner",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    name: "ZeroArgument",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "delegation",
        type: "address"
      }
    ],
    name: "DelegationCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address"
      }
    ],
    name: "Upgraded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address"
      }
    ],
    name: "VaultCreated",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_stakingVaultParams",
        type: "bytes"
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "managementFee",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "performanceFee",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "manager",
            type: "address"
          },
          {
            internalType: "address",
            name: "operator",
            type: "address"
          }
        ],
        internalType: "struct IDelegation.InitializationParams",
        name: "_initializationParams",
        type: "tuple"
      },
      {
        internalType: "address",
        name: "_lidoAgent",
        type: "address"
      }
    ],
    name: "createVault",
    outputs: [
      {
        internalType: "contract IStakingVault",
        name: "vault",
        type: "address"
      },
      {
        internalType: "contract IDelegation",
        name: "delegation",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "delegationImpl",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address"
      }
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;


