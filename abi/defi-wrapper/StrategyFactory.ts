import type { Abi } from 'viem';

export const StrategyFactoryAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'vault_', type: 'address' },
      { internalType: 'address', name: 'syncDepositQueue_', type: 'address' },
      { internalType: 'address', name: 'asyncDepositQueue_', type: 'address' },
      { internalType: 'address', name: 'asyncRedeemQueue_', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'STRATEGY_CALL_FORWARDER_IMPLEMENTATION',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STRATEGY_ID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'pool', type: 'address' },
      { internalType: 'bytes', name: 'deployBytes', type: 'bytes' },
    ],
    name: 'deploy',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const satisfies Abi;
