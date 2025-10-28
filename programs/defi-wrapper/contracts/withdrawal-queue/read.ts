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
      PAUSE_ROLE,
      RESUME_ROLE,
      FINALIZE_ROLE,
      DASHBOARD,
      LAZY_ORACLE,
      STETH,
      VAULT_HUB,
      STAKING_VAULT,
      WRAPPER,
      MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS,
      MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS,
      MAX_WITHDRAWAL_AMOUNT,
      MIN_WITHDRAWAL_AMOUNT,
      calculateCurrentStethShareRate,
      getLastCheckpointIndex,
      getLastFinalizedRequestId,
      getLastRequestId,
      isEmergencyExitActivated,
      isWithdrawalQueueStuck,
      paused,
      unfinalizedAssets,
      unfinalizedRequestNumber,
      unfinalizedStv,
    ] = await Promise.all([
      callReadMethodSilent(contract, 'DEFAULT_ADMIN_ROLE'),
      callReadMethodSilent(contract, 'PAUSE_ROLE'),
      callReadMethodSilent(contract, 'RESUME_ROLE'),
      callReadMethodSilent(contract, 'FINALIZE_ROLE'),

      callReadMethodSilent(contract, 'DASHBOARD'),
      callReadMethodSilent(contract, 'LAZY_ORACLE'),
      callReadMethodSilent(contract, 'STETH'),
      callReadMethodSilent(contract, 'VAULT_HUB'),
      callReadMethodSilent(contract, 'STAKING_VAULT'),
      callReadMethodSilent(contract, 'WRAPPER'),

      callReadMethodSilent(
        contract,
        'MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS',
      ),
      callReadMethodSilent(contract, 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS'),
      callReadMethodSilent(contract, 'MAX_WITHDRAWAL_AMOUNT'),
      callReadMethodSilent(contract, 'MIN_WITHDRAWAL_AMOUNT'),

      callReadMethodSilent(contract, 'calculateCurrentStethShareRate'),
      callReadMethodSilent(contract, 'getLastCheckpointIndex'),
      callReadMethodSilent(contract, 'getLastFinalizedRequestId'),
      callReadMethodSilent(contract, 'getLastRequestId'),

      callReadMethodSilent(contract, 'isEmergencyExitActivated'),
      callReadMethodSilent(contract, 'isWithdrawalQueueStuck'),
      callReadMethodSilent(contract, 'paused'),
      callReadMethodSilent(contract, 'unfinalizedAssets'),
      callReadMethodSilent(contract, 'unfinalizedRequestNumber'),
      callReadMethodSilent(contract, 'unfinalizedStv'),
    ]);

    logResult({
      data: [
        ['DEFAULT_ADMIN_ROLE', DEFAULT_ADMIN_ROLE],
        ['PAUSE_ROLE', PAUSE_ROLE],
        ['RESUME_ROLE', RESUME_ROLE],
        ['FINALIZE_ROLE', FINALIZE_ROLE],
        ['DASHBOARD', DASHBOARD],
        ['LAZY_ORACLE', LAZY_ORACLE],
        ['STETH', STETH],
        ['VAULT_HUB', VAULT_HUB],
        ['STAKING_VAULT', STAKING_VAULT],
        ['WRAPPER', WRAPPER],
        [
          'MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS',
          MAX_ACCEPTABLE_WQ_FINALIZATION_TIME_IN_SECONDS,
        ],
        [
          'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
          MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS,
        ],
        ['MAX_WITHDRAWAL_AMOUNT', MAX_WITHDRAWAL_AMOUNT],
        ['MIN_WITHDRAWAL_AMOUNT', MIN_WITHDRAWAL_AMOUNT],
        ['calculateCurrentStethShareRate', calculateCurrentStethShareRate],
        ['getLastCheckpointIndex', getLastCheckpointIndex],
        ['getLastFinalizedRequestId', getLastFinalizedRequestId],
        ['getLastRequestId', getLastRequestId],
        ['isEmergencyExitActivated', isEmergencyExitActivated],
        ['isWithdrawalQueueStuck', isWithdrawalQueueStuck],
        ['paused', paused],
        ['unfinalizedAssets', unfinalizedAssets],
        ['unfinalizedRequestNumber', unfinalizedRequestNumber],
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
