export const validatorConsolidationRequestsAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_lidoLocator',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'ConsolidationFeeInvalidData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ConsolidationFeeReadFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DashboardNotOwnerOfStakingVault',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAllSourceValidatorBalancesWei',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MalformedSourcePubkeysArray',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MalformedTargetPubkey',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'sourcePubkeysCount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'targetPubkeysCount',
        type: 'uint256',
      },
    ],
    name: 'MismatchingSourceAndTargetPubkeysCount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoConsolidationRequests',
    type: 'error',
  },
  {
    inputs: [],
    name: 'VaultNotConnected',
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
    name: 'CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS',
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
    name: 'LIDO_LOCATOR',
    outputs: [
      {
        internalType: 'contract ILidoLocator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getConsolidationRequestFee',
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
        internalType: 'bytes[]',
        name: '_sourcePubkeys',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes[]',
        name: '_targetPubkeys',
        type: 'bytes[]',
      },
      {
        internalType: 'address',
        name: '_dashboard',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_allSourceValidatorBalancesWei',
        type: 'uint256',
      },
    ],
    name: 'getConsolidationRequestsAndAdjustmentIncreaseEncodedCalls',
    outputs: [
      {
        internalType: 'bytes',
        name: 'adjustmentIncreaseEncodedCall',
        type: 'bytes',
      },
      {
        internalType: 'bytes[]',
        name: 'consolidationRequestEncodedCalls',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
