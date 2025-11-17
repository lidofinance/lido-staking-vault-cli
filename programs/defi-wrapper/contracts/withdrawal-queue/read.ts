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
    const contract = getWithdrawalQueueContract(address);

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
      callReadMethodSilent(contract, 'DEFAULT_ADMIN_ROLE'),
      callReadMethodSilent(contract, 'WITHDRAWALS_PAUSE_ROLE'),
      callReadMethodSilent(contract, 'WITHDRAWALS_RESUME_ROLE'),
      callReadMethodSilent(contract, 'FINALIZE_ROLE'),

      callReadMethodSilent(contract, 'DASHBOARD'),
      callReadMethodSilent(contract, 'LAZY_ORACLE'),
      callReadMethodSilent(contract, 'STETH'),
      callReadMethodSilent(contract, 'VAULT_HUB'),
      callReadMethodSilent(contract, 'VAULT'),

      callReadMethodSilent(contract, 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS'),

      callReadMethodSilent(contract, 'calculateCurrentStethShareRate'),
      callReadMethodSilent(contract, 'getLastCheckpointIndex'),
      callReadMethodSilent(contract, 'getLastFinalizedRequestId'),
      callReadMethodSilent(contract, 'getLastRequestId'),

      callReadMethodSilent(contract, 'unfinalizedAssets'),
      callReadMethodSilent(contract, 'unfinalizedStv'),
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
