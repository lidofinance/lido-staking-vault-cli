export const LazyOracleAbi = [
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
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotAuthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'cid',
        type: 'string',
      },
    ],
    name: 'VaultsReportDataUpdated',
    type: 'event',
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
        internalType: 'uint256',
        name: '_offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_limit',
        type: 'uint256',
      },
    ],
    name: 'batchVaultsInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'vault',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'balance',
            type: 'uint256',
          },
          {
            internalType: 'int256',
            name: 'inOutDelta',
            type: 'int256',
          },
          {
            internalType: 'bytes32',
            name: 'withdrawalCredentials',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'liabilityShares',
            type: 'uint256',
          },
          {
            internalType: 'uint96',
            name: 'shareLimit',
            type: 'uint96',
          },
          {
            internalType: 'uint16',
            name: 'reserveRatioBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'forcedRebalanceThresholdBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'infraFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'liquidityFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'uint16',
            name: 'reservationFeeBP',
            type: 'uint16',
          },
          {
            internalType: 'bool',
            name: 'pendingDisconnect',
            type: 'bool',
          },
        ],
        internalType: 'struct LazyOracle.VaultInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestReportData',
    outputs: [
      {
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
      {
        internalType: 'bytes32',
        name: 'treeRoot',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: 'reportCid',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestReportTimestamp',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_vaultsDataTimestamp',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_vaultsDataTreeRoot',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: '_vaultsDataReportCid',
        type: 'string',
      },
    ],
    name: 'updateReportData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
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
        name: '_totalValue',
        type: 'uint256',
      },
      {
        internalType: 'int256',
        name: '_inOutDelta',
        type: 'int256',
      },
      {
        internalType: 'uint256',
        name: '_feeSharesCharged',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_liabilityShares',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'updateVaultData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
