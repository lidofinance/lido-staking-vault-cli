import { type Address } from 'viem';
import { Option } from 'commander';

import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/index.js';
import {
  generateReadCommands,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
} from 'utils';

import { withdrawalQueue } from './main.js';
import { readCommandConfig } from './config.js';

const withdrawalQueueRead = withdrawalQueue
  .command('read')
  .alias('r')
  .description('read commands');

withdrawalQueueRead.addOption(new Option('-cmd2json'));
withdrawalQueueRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(withdrawalQueueRead));
  process.exit();
});

withdrawalQueueRead
  .command('info')
  .description('get withdrawal queue base info')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getWithdrawalQueueContract(address);

    const [
      DEFAULT_ADMIN_ROLE,
      WITHDRAWALS_PAUSE_ROLE,
      WITHDRAWALS_RESUME_ROLE,
      FINALIZE_ROLE,
      DASHBOARD,
      LAZY_ORACLE,
      STETH,
      VAULT_HUB,
      VAULT,
      MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS,
      calculateCurrentStethShareRate,
      getLastCheckpointIndex,
      getLastFinalizedRequestId,
      getLastRequestId,
      unfinalizedAssets,
      unfinalizedStv,
    ] = await Promise.all([
      callReadMethodSilent({
        contract,
        methodName: 'DEFAULT_ADMIN_ROLE',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'WITHDRAWALS_PAUSE_ROLE',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'WITHDRAWALS_RESUME_ROLE',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'FINALIZE_ROLE',
        payload: [],
      }),

      callReadMethodSilent({ contract, methodName: 'DASHBOARD', payload: [] }),
      callReadMethodSilent({
        contract,
        methodName: 'LAZY_ORACLE',
        payload: [],
      }),
      callReadMethodSilent({ contract, methodName: 'STETH', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'VAULT_HUB', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'VAULT', payload: [] }),

      callReadMethodSilent({
        contract,
        methodName: 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
        payload: [],
      }),

      callReadMethodSilent({
        contract,
        methodName: 'calculateCurrentStethShareRate',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'getLastCheckpointIndex',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'getLastFinalizedRequestId',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'getLastRequestId',
        payload: [],
      }),

      callReadMethodSilent({
        contract,
        methodName: 'unfinalizedAssets',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'unfinalizedStv',
        payload: [],
      }),
    ]);

    logResult({
      data: [
        ['DEFAULT_ADMIN_ROLE', DEFAULT_ADMIN_ROLE],
        ['WITHDRAWALS_PAUSE_ROLE', WITHDRAWALS_PAUSE_ROLE],
        ['WITHDRAWALS_RESUME_ROLE', WITHDRAWALS_RESUME_ROLE],
        ['FINALIZE_ROLE', FINALIZE_ROLE],
        ['DASHBOARD', DASHBOARD],
        ['LAZY_ORACLE', LAZY_ORACLE],
        ['STETH', STETH],
        ['VAULT_HUB', VAULT_HUB],
        ['VAULT', VAULT],
        [
          'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
          MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS,
        ],
        ['calculateCurrentStethShareRate', calculateCurrentStethShareRate],
        ['getLastCheckpointIndex', getLastCheckpointIndex],
        ['getLastFinalizedRequestId', getLastFinalizedRequestId],
        ['getLastRequestId', getLastRequestId],
        ['unfinalizedAssets', unfinalizedAssets],
        ['unfinalizedStv', unfinalizedStv],
      ],
    });
  });

generateReadCommands(
  WithdrawalQueueAbi,
  getWithdrawalQueueContract,
  withdrawalQueueRead,
  readCommandConfig,
);
