export const ReportCheckerAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'leaf',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
    ],
    name: 'InvalidProof',
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
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_valuation',
        type: 'uint256',
      },
      {
        internalType: 'int256',
        name: '_inOutDelta',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: '_fees',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_sharesMinted',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'checkReport',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReportCheckerData',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_vaultsDataTreeRoot',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: '_vaultsDataTreeCid',
        type: 'string',
      },
    ],
    name: 'updateReportCheckerData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
