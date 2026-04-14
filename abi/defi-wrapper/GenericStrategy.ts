import type { Abi } from 'viem';

export const GenericStrategyAbi = [
  {
    type: 'function',
    name: 'ALLOW_LIST_ENABLED',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAllowListed',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'safeTransferERC20',
    inputs: [
      {
        name: '_token',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'STRATEGY_ID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'WSTETH',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IWstETH',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'burnWsteth',
    inputs: [
      {
        name: '_wstethToBurn',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mintedStethSharesOf',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'mintedStethShares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'requestWithdrawalFromPool',
    inputs: [
      {
        name: '_recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stvToWithdraw',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_stethSharesToRebalance',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'requestId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supply',
    inputs: [
      {
        name: '_referral',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_wstethToMint',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_params',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'stv',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'wstethOf',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStrategyCallForwarderAddress',
    inputs: [
      {
        name: '_user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'callForwarder',
        type: 'address',
        internalType: 'contract IStrategyCallForwarder',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'ZeroArgument',
    inputs: [
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
] as const satisfies Abi;

export type GenericStrategyAbiType = typeof GenericStrategyAbi;
