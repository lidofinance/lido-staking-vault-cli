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
  logError,
  logTable,
  callWriteMethodWithReceiptBatchCalls,
  stringArrayToAddressArray,
} from 'utils';
import { wrapperOperations } from './main.js';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/withdrawal-queue.js';
import {
  encodeFunctionData,
  formatEther,
  parseEventLogs,
  zeroAddress,
  type Address,
} from 'viem';
import { getDashboardContract, getVaultHubContract } from 'contracts';
import { getStvPoolContract } from 'contracts/defi-wrapper/stv-pool.js';
import { bigIntMin } from 'utils/bigInt.js';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/stv-steth-pool.js';
import { areVaultParamsInSync } from 'features';

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
      logError(
        `Provided gas cost coverage of ${formatEther(gasCostCoverage)} ETH (${gasCostCoverage} wei) exceeds the maximum allowed value of ${formatEther(maxGasCostCoverage)} ETH (${maxGasCostCoverage} wei) for the withdrawal queue at address: ${address}. Please provide a valid value.`,
      );
      return;
    }

    if (currentGasCostCoverage === gasCostCoverage) {
      logError(
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

wrapperOperationsWrite
  .command('sync-vault-params')
  .description('sync vault params between vault & pool')
  .argument('<poolAddress>', 'pool address', stringToAddress)
  .action(async (address: Address) => {
    const isInSync = await areVaultParamsInSync(address);

    if (isInSync) {
      logError(
        '⚠️⚠️⚠️ Vault parameters are already in sync. No changes needed. ⚠️⚠️⚠️',
      );
      return;
    }

    const pool = await getStvStethPoolContract(address);

    const { receipt } = await callWriteMethodWithReceipt({
      contract: pool,
      methodName: 'syncVaultParameters',
      payload: [],
    });

    if (receipt?.logs) {
      const logs = parseEventLogs({
        abi: pool.abi,
        logs: receipt.logs,
        strict: true,
      });

      const hadEffect = logs.find(
        (log) => log.eventName === 'VaultParametersUpdated',
      );

      if (!hadEffect) {
        logInfo(
          '⚠️⚠️⚠️ Vault parameters are already in sync. No changes were made during your tx. ⚠️⚠️⚠️',
        );
        return;
      }
    }
  });

wrapperOperationsWrite
  .command('allow-list-add')
  .description('add addresses(divided by spaces) to allow list ')
  .argument('<poolAddress>', 'pool address', stringToAddress)
  .argument(
    '<addressToAdd...>',
    '1 or more addresses to add to allow list divided by spaces',
    stringArrayToAddressArray,
    [],
  )
  .action(async (address: Address, addressToAdd: Address[]) => {
    const pool = await getStvPoolContract(address);
    const isAllowListEnabled = await callReadMethod({
      contract: pool,
      methodName: 'ALLOW_LIST_ENABLED',
      payload: [],
    });

    if (!isAllowListEnabled) {
      logError('Pool is not configured for using allow list.');
      return;
    }

    logTable({
      data: addressToAdd.map((addr) => [addr]),
      params: { head: ['Addresses to be added to allow list:'] },
    });

    const confirm = await confirmOperation(
      `Are you sure you want to add  ${addressToAdd.length} addresses to the allow list of the pool at address: ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceiptBatchCalls({
      calls: addressToAdd.map((addr) => ({
        to: pool.address,
        data: encodeFunctionData({
          abi: pool.abi,
          functionName: 'addToAllowList',
          args: [addr],
        }),
        value: 0n,
      })),
    });
  });

wrapperOperationsWrite
  .command('allow-list-remove')
  .description('remove addresses(divided by spaces) from allow list ')
  .argument('<poolAddress>', 'pool address', stringToAddress)
  .argument(
    '<addressesToRemove...>',
    '1 or more addresses to remove divided by spaces',
    stringArrayToAddressArray,
    [],
  )
  .action(async (address: Address, addressesToRemove: Address[]) => {
    const pool = await getStvPoolContract(address);
    const isAllowListEnabled = await callReadMethod({
      contract: pool,
      methodName: 'ALLOW_LIST_ENABLED',
      payload: [],
    });

    if (!isAllowListEnabled) {
      logError('Pool is not configured for using allow list.');
      return;
    }

    logTable({
      data: addressesToRemove.map((addr) => [addr]),
      params: { head: ['Addresses to be removed from allow list:'] },
    });

    const confirm = await confirmOperation(
      `Are you sure you want to remove ${addressesToRemove.length} addresses from the allow list of the pool at address: ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceiptBatchCalls({
      calls: addressesToRemove.map((addr) => ({
        to: pool.address,
        data: encodeFunctionData({
          abi: pool.abi,
          functionName: 'removeFromAllowList',
          args: [addr],
        }),
        value: 0n,
      })),
    });
  });
