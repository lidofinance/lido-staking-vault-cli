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
        "name": "",
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
            "name": "curator",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "minterBurner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "funderWithdrawer",
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
            "internalType": "uint256",
            "name": "curatorFeeBP",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nodeOperatorFeeBP",
            "type": "uint256"
          }
        ],
        "internalType": "struct IDelegation.InitialState",
        "name": "_delegationInitialState",
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
        "internalType": "contract IDelegation",
        "name": "delegation",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;


