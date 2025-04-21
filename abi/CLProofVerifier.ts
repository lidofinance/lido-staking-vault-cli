export const CLProofVerifierAbi = [
  {
    inputs: [
      {
        internalType: 'GIndex',
        name: '_gIFirstValidator',
        type: 'bytes32',
      },
      {
        internalType: 'GIndex',
        name: '_gIFirstValidatorAfterChange',
        type: 'bytes32',
      },
      {
        internalType: 'uint64',
        name: '_changeSlot',
        type: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'IndexOutOfRange',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPubkeyLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RootNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BEACON_ROOTS',
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
    name: 'GI_FIRST_VALIDATOR',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GI_FIRST_VALIDATOR_AFTER_CHANGE',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GI_PUBKEY_WC_PARENT',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GI_STATE_ROOT',
    outputs: [
      {
        internalType: 'GIndex',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SLOT_CHANGE_GI_FIRST_VALIDATOR',
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
    inputs: [],
    name: 'STATE_ROOT_DEPTH',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STATE_ROOT_POSITION',
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
        internalType: 'uint64',
        name: 'parentBlockTimestamp',
        type: 'uint64',
      },
    ],
    name: 'TEST_getParentBlockRoot',
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
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
    ],
    name: 'TEST_getValidatorGI',
    outputs: [
      {
        internalType: 'GIndex',
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
        ],
        internalType: 'struct IPredepositGuarantee.ValidatorWitness',
        name: '_witness',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: '_withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'TEST_validatePubKeyWCProof',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WC_PUBKEY_PARENT_DEPTH',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WC_PUBKEY_PARENT_POSITION',
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
] as const;
