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
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ConsolidationFeeRefundFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
    ],
    name: 'ConsolidationRequestFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'provided',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'required',
        type: 'uint256',
      },
    ],
    name: 'InsufficientValidatorConsolidationFee',
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes[]',
        name: 'sourcePubkeys',
        type: 'bytes[]',
      },
      {
        indexed: false,
        internalType: 'bytes[]',
        name: 'targetPubkeys',
        type: 'bytes[]',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'refundRecipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'excess',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'adjustmentIncrease',
        type: 'uint256',
      },
    ],
    name: 'ConsolidationRequestsAndRewardsAdjustmentIncreased',
    type: 'event',
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
        name: '_refundRecipient',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_dashboard',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_adjustmentIncrease',
        type: 'uint256',
      },
    ],
    name: 'addConsolidationRequestsAndIncreaseRewardsAdjustment',
    outputs: [],
    stateMutability: 'payable',
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
        name: '_adjustmentIncrease',
        type: 'uint256',
      },
    ],
    name: 'getConsolidationRequestsAndAdjustmentIncreaseEncodedCalls',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'consolidationRequestEncodedCalls',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes',
        name: 'adjustmentIncreaseEncodedCall',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
