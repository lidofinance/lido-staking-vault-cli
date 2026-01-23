import { Option, program } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  stringToBigInt,
  callReadMethod,
  confirmOperation,
  submitReport,
  callWriteMethodWithReceipt,
} from 'utils';
import { wrapperOperations } from './main.js';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/withdrawal-queue.js';
import { formatEther, zeroAddress, type Address } from 'viem';
import { getDashboardContract, getVaultHubContract } from 'contracts';
import { getStvPoolContract } from 'contracts/defi-wrapper/stv-pool.js';
import { bigIntMin } from 'utils/bigInt.js';
export const wrapperOperationsWrite = wrapperOperations
  .command('write')
  .aliases(['w'])
  .description('wrapper operations write commands');

wrapperOperationsWrite.addOption(new Option('-cmd2json'));
wrapperOperationsWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(wrapperOperationsWrite));
  process.exit();
});

wrapperOperationsWrite
  .command('set-finalization-gas-cost-coverage')
  .description('set finalization gas cost coverage')
  .argument('<address>', 'withdrawal queue address', stringToAddress)
  .argument(
    '<gasCostCoverage>',
    'gas cost coverage per withdrawal finalization in wei (max 0.0005 ETH)',
    stringToBigInt,
  )
  .action(async (address: Address, gasCostCoverage: bigint) => {
    const withdrawalQueue = await getWithdrawalQueueContract(address);

    const currentGasCostCoverage = await callReadMethod({
      contract: withdrawalQueue,
      methodName: 'getFinalizationGasCostCoverage',
      payload: [],
    });

    const maxGasCostCoverage = await callReadMethod({
      contract: withdrawalQueue,
      methodName: 'MAX_GAS_COST_COVERAGE',
      payload: [],
    });

    if (gasCostCoverage > maxGasCostCoverage) {
      logInfo(
        `Provided gas cost coverage of ${formatEther(gasCostCoverage)} ETH (${gasCostCoverage} wei) exceeds the maximum allowed value of ${formatEther(maxGasCostCoverage)} ETH (${maxGasCostCoverage} wei) for the withdrawal queue at address: ${address}. Please provide a valid value.`,
      );
      return;
    }

    if (currentGasCostCoverage === gasCostCoverage) {
      logInfo(
        `Finalization gas cost coverage is already set to ${formatEther(gasCostCoverage)} ETH (${gasCostCoverage} wei) for the withdrawal queue at address: ${address}. No changes needed.`,
      );
      return;
    }

    const confirmationMessage = `Are you sure you want to update finalization gas cost coverage from  ${formatEther(currentGasCostCoverage)} ETH (${currentGasCostCoverage} wei) to ${formatEther(gasCostCoverage)} ETH (${gasCostCoverage} wei) for the withdrawal queue at address: ${address}?`;
    const confirm = await confirmOperation(confirmationMessage);
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: withdrawalQueue,
      methodName: 'setFinalizationGasCostCoverage',
      payload: [gasCostCoverage],
    });
  });

wrapperOperationsWrite
  .command('finalize-withdrawals')
  .description('finalize pending withdrawals in the wrapper')
  .argument('<poolAddress>', 'pool address', stringToAddress)
  .option(
    '-mxr, --max-requests <maxRequestCount>',
    'maximum number of requests to finalize, default: 1000',
    stringToBigInt,
    1000n,
  )
  .option(
    '-gcr, --gas-coverage-recipient <gasCoverageRecipient>',
    'address to receive gas coverage(if any), defaults to tx sender',
    stringToAddress,
    zeroAddress,
  )
  .action(
    async (
      address: Address,
      {
        maxRequestCount = 1000n,
        gasCoverageRecipient = zeroAddress,
      }: { maxRequestCount: bigint; gasCoverageRecipient: Address },
    ) => {
      const pool = await getStvPoolContract(address);
      const withdrawalQueueAddress = await callReadMethod({
        contract: pool,
        methodName: 'WITHDRAWAL_QUEUE',
        payload: [],
      });

      const withdrawalQueue = await getWithdrawalQueueContract(
        withdrawalQueueAddress,
      );
      logInfo(
        `Checking for pending withdrawals to finalize in WithdrawalQueue at address: ${address}...`,
      );
      const requestsToFinalize = await callReadMethod({
        contract: withdrawalQueue,
        methodName: 'unfinalizedRequestsNumber',
        payload: [],
        withSpinner: true,
      });

      if (requestsToFinalize === 0n) {
        logInfo('No pending withdrawals to finalize.');
        return;
      }

      logInfo(
        `Found ${requestsToFinalize} pending withdrawals to finalize. Proceeding with finalization...`,
      );

      if (requestsToFinalize > maxRequestCount) {
        logInfo(
          `Only ${maxRequestCount}/${requestsToFinalize} requests will be finalized in this operation.`,
        );
      }
      const dashboardAddress = await callReadMethod({
        contract: withdrawalQueue,
        methodName: 'DASHBOARD',
        payload: [],
        withSpinner: true,
      });

      const dashboard = await getDashboardContract(dashboardAddress);
      const vaultHub = await getVaultHubContract();

      const vaultAddress = await callReadMethod({
        contract: dashboard,
        methodName: 'stakingVault',
        payload: [],
        withSpinner: true,
      });

      const isReportFresh = await callReadMethod({
        contract: vaultHub,
        methodName: 'isReportFresh',
        payload: [[vaultAddress]],
        withSpinner: true,
      });

      if (!isReportFresh) {
        logInfo(
          'The latest report for the staking vault is not fresh. The last report should be submitted before finalizing withdrawals.',
        );

        const { isFresh } = await submitReport({
          vault: vaultAddress,
          populateTx: program.opts().populateTx,
        });

        if (!isFresh)
          // submitReport prompts user for report submission confirmation
          // we can exit if user denies report submission
          return;
      }

      const requestToBeFinalized = bigIntMin(
        requestsToFinalize,
        maxRequestCount,
      );

      const confirm = await confirmOperation(
        `Are you sure you want to finalize up to ${requestToBeFinalized}/${requestsToFinalize} withdrawal requests for the WithdrawalQueue at address: ${address}?`,
      );

      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: withdrawalQueue,
        methodName: 'finalize',
        payload: [maxRequestCount, gasCoverageRecipient],
      });
    },
  );
