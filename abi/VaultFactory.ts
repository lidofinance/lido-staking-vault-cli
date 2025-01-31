export const VaultFactoryAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_beacon",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_delegationImpl",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "CloneArgumentsTooLong",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedDeployment",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "argument",
        "type": "string"
      }
    ],
    "name": "ZeroArgument",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "admin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegation",
        "type": "address"
      }
    ],
    "name": "DelegationCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }
    ],
    "name": "VaultCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BEACON",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DELEGATION_IMPL",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "defaultAdmin",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "funder",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "withdrawer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "minter",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "burner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "rebalancer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "depositPauser",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "depositResumer",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "exitRequester",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "disconnecter",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "curator",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "nodeOperatorManager",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "nodeOperatorFeeClaimer",
            "type": "address"
          },
          {
            "internalType": "uint16",
            "name": "curatorFeeBP",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "nodeOperatorFeeBP",
            "type": "uint16"
          }
        ],
        "internalType": "struct DelegationConfig",
        "name": "_delegationConfig",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "_stakingVaultInitializerExtraParams",
        "type": "bytes"
      }
    ],
    "name": "createVaultWithDelegation",
    "outputs": [
      {
        "internalType": "contract IStakingVault",
        "name": "vault",
        "type": "address"
      },
      {
        "internalType": "contract Delegation",
        "name": "delegation",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;


