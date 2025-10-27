import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import {
  ReadProgramCommandConfig,
  stringToAddress,
  stringToBigIntArray,
} from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof WithdrawalQueueAbi
> = {
  MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS: {
    name: 'MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS',
    description: 'get max time for finalization of the withdrawal request',
  },
  MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS: {
    name: 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
    description: 'get min delay between withdrawal request and finalization',
  },
  MAX_WITHDRAWAL_AMOUNT: {
    name: 'MAX_WITHDRAWAL_AMOUNT',
    description: 'get max amount of assets that is possible to withdraw',
  },
  MIN_WITHDRAWAL_AMOUNT: {
    name: 'MIN_WITHDRAWAL_AMOUNT',
    description: 'get min amount of assets that is possible to withdraw',
  },
  calculateCurrentStethShareRate: {
    name: 'calc-steth-share-rate',
    description: 'get calculated current stETH share rate',
  },
  calculateCurrentStvRate: {
    name: 'calc-stv-rate',
    description: 'get calculate current stv rate of the vault',
  },
  getLastCheckpointIndex: {
    name: 'last-checkpoint-index',
    aliases: ['lci'],
    description: 'get the last checkpoint index',
  },
  getLastFinalizedRequestId: {
    name: 'last-finalized-request-id',
    aliases: ['lfri'],
    description: 'get the last finalized request id',
  },
  getLastRequestId: {
    name: 'last-request-id',
    aliases: ['lri'],
    description: 'get the last request id',
  },
  findCheckpointHints: {
    name: 'find-checkpoint-hints',
    aliases: ['fch'],
    description:
      'get the list of hints for the given `_requestIds` searching among the checkpoints with indices in the range [ `_firstIndex`, `_lastIndex` ]',
    arguments: {
      _requestIds: {
        name: 'requestIds',
        description: 'request ids',
        modifier: stringToBigIntArray,
      },
      _firstIndex: {
        name: 'firstIndex',
        description: 'first index',
        modifier: (value) => BigInt(value),
      },
      _lastIndex: {
        name: 'lastIndex',
        description: 'last index',
        modifier: (value) => BigInt(value),
      },
    },
  },
  getClaimableEther: {
    name: 'get-claimable-ether',
    description:
      'get amount of ether available for claim for each provided request id',
    arguments: {
      _requestIds: {
        name: 'requestIds',
        description: 'request ids',
        modifier: stringToBigIntArray,
      },
      _hints: {
        name: 'hints',
        description: 'hints',
        modifier: stringToBigIntArray,
      },
    },
  },
  getWithdrawalRequests: {
    name: 'get-withdrawal-requests',
    description:
      'get all withdrawal requests that belong to the `_owner` address',
    arguments: {
      _owner: {
        name: 'owner',
        description: 'owner',
        modifier: stringToAddress,
      },
      _start: {
        name: 'start',
        description: 'start index',
        modifier: (value) => BigInt(value),
      },
      _end: {
        name: 'end',
        description: 'end index',
        modifier: (value) => BigInt(value),
      },
    },
  },
  getWithdrawalRequestsLength: {
    name: 'get-withdrawal-requests-length',
    aliases: ['gwrl'],
    description:
      'get the length of the withdrawal requests that belong to the `_owner` address.',
    arguments: {
      _owner: {
        name: 'owner',
        description: 'owner',
        modifier: stringToAddress,
      },
    },
  },
  getWithdrawalStatus: {
    name: 'w-status',
    description: 'get the status for a single request',
    arguments: {
      _requestId: {
        name: 'requestId',
        description: 'request id',
        modifier: (value) => BigInt(value),
      },
    },
  },
  getWithdrawalsStatus: {
    name: 'w-statuses',
    description: 'get status for requests with provided ids',
    arguments: {
      _requestIds: {
        name: 'requestIds',
        description: 'request ids',
        modifier: stringToBigIntArray,
      },
    },
  },
  isEmergencyExitActivated: {
    name: 'is-ee-activated',
    description: 'get true if Emergency Exit is activated',
  },
  isWithdrawalQueueStuck: {
    name: 'is-stuck',
    description: 'get true if requests have not been finalized for a long time',
  },
  unfinalizedAssets: {
    name: 'unfinal-assets',
    description: 'get the amount of assets in the queue yet to be finalized',
  },
  unfinalizedRequestNumber: {
    name: 'unfinal-request-number',
    description: 'get the number of unfinalized requests in the queue',
  },
  unfinalizedStv: {
    name: 'unfinal-stv',
    description: 'get the amount of stv in the queue yet to be finalized',
  },
};
