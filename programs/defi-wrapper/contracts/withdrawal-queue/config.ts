import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { ReadProgramCommandConfig, stringToBigIntArray } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof WithdrawalQueueAbi
> = {
  MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS: {
    name: 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
    description: 'get min delay between withdrawal request and finalization',
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
  unfinalizedAssets: {
    name: 'unfinal-assets',
    description: 'get the amount of assets in the queue yet to be finalized',
  },
  unfinalizedStv: {
    name: 'unfinal-stv',
    description: 'get the amount of stv in the queue yet to be finalized',
  },
};
