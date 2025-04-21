export const BLSHarnessAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'InputHasInfinityPoints',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPubkeyLength',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSignature',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LOCAL_MESSAGE_1',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes',
                name: 'pubkey',
                type: 'bytes',
              },
              {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes',
              },
              {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
              },
              {
                internalType: 'bytes32',
                name: 'depositDataRoot',
                type: 'bytes32',
              },
            ],
            internalType: 'struct StakingVaultDeposit',
            name: 'deposit',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bytes32',
                    name: 'a',
                    type: 'bytes32',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'b',
                    type: 'bytes32',
                  },
                ],
                internalType: 'struct BLS12_381.Fp',
                name: 'pubkeyY',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'bytes32',
                    name: 'c0_a',
                    type: 'bytes32',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'c0_b',
                    type: 'bytes32',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'c1_a',
                    type: 'bytes32',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'c1_b',
                    type: 'bytes32',
                  },
                ],
                internalType: 'struct BLS12_381.Fp2',
                name: 'signatureY',
                type: 'tuple',
              },
            ],
            internalType: 'struct BLS12_381.DepositY',
            name: 'depositYComponents',
            type: 'tuple',
          },
          {
            internalType: 'bytes32',
            name: 'withdrawalCredentials',
            type: 'bytes32',
          },
        ],
        internalType: 'struct PrecomputedDepositMessage',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'verifier',
    outputs: [
      {
        internalType: 'contract BLS__HarnessVerifier',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'verifyBLSSupport',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'pubkey',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'depositDataRoot',
            type: 'bytes32',
          },
        ],
        internalType: 'struct StakingVaultDeposit',
        name: 'deposit',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'b',
                type: 'bytes32',
              },
            ],
            internalType: 'struct BLS12_381.Fp',
            name: 'pubkeyY',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'bytes32',
                name: 'c0_a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c0_b',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c1_a',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'c1_b',
                type: 'bytes32',
              },
            ],
            internalType: 'struct BLS12_381.Fp2',
            name: 'signatureY',
            type: 'tuple',
          },
        ],
        internalType: 'struct BLS12_381.DepositY',
        name: 'depositY',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'withdrawalCredentials',
        type: 'bytes32',
      },
    ],
    name: 'verifyDepositMessage',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
