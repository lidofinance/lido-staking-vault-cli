export const validatorConsolidationRequestsAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_lidoLocator',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'CONSOLIDATION_REQUEST_PREDEPLOY_ADDRESS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'LIDO_LOCATOR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract ILidoLocator',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'THIS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'addConsolidationRequestsEOA',
    inputs: [
      {
        name: '_sourcePubkeys',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: '_targetPubkeys',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: '_refundRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stakingVault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_adjustmentIncrease',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'addConsolidationRequestsMultisig',
    inputs: [
      {
        name: '_sourcePubkeys',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: '_targetPubkeys',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
      {
        name: '_refundRecipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_stakingVault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_adjustmentIncrease',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getConsolidationRequestFee',
    inputs: [],
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
    type: 'event',
    name: 'ConsolidationRequestsAdded',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'sourcePubkeys',
        type: 'bytes[]',
        indexed: false,
        internalType: 'bytes[]',
      },
      {
        name: 'targetPubkeys',
        type: 'bytes[]',
        indexed: false,
        internalType: 'bytes[]',
      },
      {
        name: 'refundRecipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'excess',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'adjustmentIncrease',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ConsolidationFeeInvalidData',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ConsolidationFeeReadFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ConsolidationFeeRefundFailed',
    inputs: [
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'ConsolidationRequestAdditionFailed',
    inputs: [
      {
        name: 'callData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientValidatorConsolidationFee',
    inputs: [
      {
        name: 'provided',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'required',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'MalformedPubkeysArray',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MalformedTargetPubkey',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MismatchingSourceAndTargetPubkeysCount',
    inputs: [
      {
        name: 'sourcePubkeysCount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'targetPubkeysCount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'NoConsolidationRequests',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotDelegateCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'VaultNotConnected',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ZeroArgument',
    inputs: [
      {
        name: 'argName',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
] as const;
