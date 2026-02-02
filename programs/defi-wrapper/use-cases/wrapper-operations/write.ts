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
  callReadMethodSilent,
  stringToNumber,
} from 'utils';
import { wrapperOperations } from './main.js';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/withdrawal-queue.js';
import {
  encodeFunctionData,
  formatEther,
  parseEventLogs,
  WatchContractEventOnLogsParameter,
  zeroAddress,
  type Address,
} from 'viem';
import {
  getDashboardContract,
  getLazyOracleContract,
  getVaultHubContract,
} from 'contracts';
import { getStvPoolContract } from 'contracts/defi-wrapper/stv-pool.js';
import { bigIntMin } from 'utils/bigInt.js';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/stv-steth-pool.js';
import { areVaultParamsInSync, tryFetchPost } from 'features';
import { LazyOracleAbi } from 'abi';

export const wrapperOperationsWrite = wrapperOperations
  .command('write')
  .aliases(['w'])
  .description('wrapper operations write commands');

wrapperOperationsWrite.addOption(new Option('-cmd2json'));
wrapperOperationsWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(wrapperOperationsWrite));
  process.exit();
});

//
// Finalization Operations
//

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
      const lazyOracle = await getLazyOracleContract();

      const vaultAddress = await callReadMethod({
        contract: dashboard,
        methodName: 'stakingVault',
        payload: [],
        withSpinner: true,
      });

      const isReportFreshnessCheck = await callReadMethod({
        contract: vaultHub,
        methodName: 'isReportFresh',
        payload: [[vaultAddress]],
        withSpinner: true,
      });

      const { timestamp: latestVaultAppliedReportTimestamp } =
        await callReadMethod({
          contract: vaultHub,
          methodName: 'latestReport',
          payload: [[vaultAddress]],
          withSpinner: true,
        });

      const latestReportTimestamp = await callReadMethod({
        contract: lazyOracle,
        methodName: 'latestReportTimestamp',
        payload: [],
        withSpinner: true,
      });

      const isReportFresh =
        isReportFreshnessCheck &&
        // this accounts for freshness > oracle reporting interval
        latestReportTimestamp <= latestVaultAppliedReportTimestamp;

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

///
/// Allow List Operations
///

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

wrapperOperationsWrite
  .command('auto-report')
  .description(
    `watches for new reports, automatically submits report and finalizes withdrawals. Will run indefinitely.
      For finalization make sure private key has FINALIZE_ROLE in the withdrawal queue.
      ⚠️⚠️⚠️ For production use consider running with a process manager ⚠️⚠️⚠️`,
  )
  .argument('<poolAddress>', 'pool address', stringToAddress)
  .option('--skip-report', 'skip report submission step', false)
  .option('--skip-finalize', 'skip finalize withdrawals step', false)
  .option(
    '--callback-url <callbackUrl>',
    'callback url to notify when report is submitted and withdrawals are finalized via POST request',
  )
  .option(
    '--gas-coverage-recipient <gasCoverageRecipient>',
    'address to receive gas coverage(if any), defaults to tx sender',
    stringToAddress,
    zeroAddress,
  )
  .option(
    '--max-requests <maxRequestCount>',
    'maximum number of requests to finalize',
    stringToBigInt,
    1000n,
  )
  .option(
    '--polling-interval <pollingInterval>',
    'polling interval in ms for checking new reports, default: 60_000 (1 minute)',
    stringToNumber,
    60_000,
  )
  .action(
    async (
      address: Address,
      {
        skipReport,
        skipFinalize,
        maxRequests,
        gasCoverageRecipient,
        pollingInterval,
        callbackUrl,
      }: {
        skipReport: boolean;
        skipFinalize: boolean;
        maxRequests: bigint;
        pollingInterval: number;
        gasCoverageRecipient: Address;
        callbackUrl?: string;
      },
    ) => {
      if (skipReport && !skipFinalize) {
        logError(
          'Cannot skip report submission when finalizing withdrawals. Report must be fresh before finalization.',
        );
        return;
      }

      if (pollingInterval >= 5 * 60_000) {
        logInfo(
          'Polling interval is greater than or equal to 5 minutes. Due to limits in eth_newFilter filters may be dropped by the node. Consider using shorter polling interval.',
        );
      }

      const pool = await getStvPoolContract(address);
      const vaultAddress = await callReadMethod({
        contract: pool,
        methodName: 'VAULT',
        payload: [],
      });
      const withdrawalQueueAddress = await callReadMethod({
        contract: pool,
        methodName: 'WITHDRAWAL_QUEUE',
        payload: [],
      });
      const lazyOracle = await getLazyOracleContract();
      const vaultHub = await getVaultHubContract();

      const withdrawalQueue = await getWithdrawalQueueContract(
        withdrawalQueueAddress,
      );

      const FINALIZER_ROLE = await callReadMethod({
        contract: withdrawalQueue,
        methodName: 'FINALIZE_ROLE',
        payload: [],
      });

      const finalizers = await callReadMethod({
        contract: withdrawalQueue,
        methodName: 'getRoleMembers',
        payload: [[FINALIZER_ROLE]],
      });

      const finalizer = finalizers[0];
      if (!finalizer) {
        logError(
          'No FINALIZE_ROLE holders found for the withdrawal queue. Cannot proceed with auto-reporting.',
        );
        return;
      }

      const onNewReport = async (
        events: WatchContractEventOnLogsParameter<
          typeof LazyOracleAbi,
          'VaultsReportDataUpdated',
          true
        >,
      ) => {
        const event = events[0];
        if (event) {
          logTable({
            params: { head: ['New report is available'] },
            data: [
              ['Data CID', event.args.cid],
              ['Merkle Root', event.args.root],
              ['Ref slot', event.args.refSlot],
              ['Timestamp', event.args.timestamp],
              ['Block Number', event.blockNumber],
              ['Transaction Hash', event.transactionHash],
            ],
          });
        }

        const isConnected = await callReadMethod({
          contract: vaultHub,
          methodName: 'isVaultConnected',
          payload: [[vaultAddress]],
        });

        const isReportFresh = await callReadMethodSilent({
          contract: vaultHub,
          methodName: 'isReportFresh',
          payload: [[vaultAddress]],
        });

        if (!isConnected) {
          logError(
            `Vault ${vaultAddress} is not connected to VaultHub. Cannot proceed with report submission.`,
          );
        }

        if (isReportFresh) {
          logInfo('Report is already fresh. No submission needed.');
        }

        let reportTxHash: string | null = null;
        if (!skipReport && isConnected && !isReportFresh) {
          const { isFresh, tx } = await submitReport({
            vault: vaultAddress,
            skipConfirmation: true,
          });
          reportTxHash = tx ?? null;
          logInfo(`Report submission completed. isFresh: ${isFresh}`);
        } else {
          logInfo('Report submission step skipped.');
        }

        let canFinalize = false;
        let requestsFinalized = 0n;
        let assetsFinalized = 0n;
        let finalizationTxHash: string | null = null;

        const unfinalizedRequestsNumber = await callReadMethod({
          contract: withdrawalQueue,
          methodName: 'unfinalizedRequestsNumber',
          payload: [],
        });
        const unfinalizedAssets = await callReadMethod({
          contract: withdrawalQueue,
          methodName: 'unfinalizedAssets',
          payload: [],
        });
        const lastFinalizedRequestId = await callReadMethod({
          contract: withdrawalQueue,
          methodName: 'getLastFinalizedRequestId',
          payload: [],
        });

        if (unfinalizedRequestsNumber > 0n) {
          try {
            const { result: requestFinalized } =
              await withdrawalQueue.simulate.finalize(
                [maxRequests, zeroAddress],
                {
                  account: finalizers[0],
                },
              );

            logInfo(
              `Finalization Simulation:
                requests finalized ${requestFinalized}/${unfinalizedRequestsNumber}`,
            );

            // this is a sanity check, should not happen in contract
            if (requestFinalized <= 0n)
              throw new Error('No requests finalized in simulation');
            canFinalize = true;
          } catch (error) {
            canFinalize = false;
            logInfo('Finalization simulation failed', error);
          }
        } else {
          logInfo('No pending withdrawals to finalize.');
        }

        if (!skipFinalize) {
          if (canFinalize) {
            logInfo('Proceeding to finalize withdrawals...');
            const txResult = await callWriteMethodWithReceipt({
              contract: withdrawalQueue,
              methodName: 'finalize',
              payload: [maxRequests, gasCoverageRecipient],
            });
            finalizationTxHash = txResult.tx ?? null;
            requestsFinalized = await callReadMethod({
              contract: withdrawalQueue,
              methodName: 'getLastFinalizedRequestId',
              payload: [],
            });
            assetsFinalized = await callReadMethod({
              contract: withdrawalQueue,
              methodName: 'unfinalizedAssets',
              payload: [],
            });

            assetsFinalized = unfinalizedAssets - assetsFinalized;
            requestsFinalized -= lastFinalizedRequestId;
          } else {
            logInfo(
              'Finalization step skipped due to lack of pending withdrawals or simulation failure.',
            );
          }
        } else {
          logInfo('Finalization step skipped.');
        }

        logTable({
          data: [
            ['Pool Address', address],
            ['Vault Address', vaultAddress],
            ['Is Connected', isConnected],
            ['Was Report Fresh', isReportFresh],
            ['Report Submitted', !skipReport && isConnected && !isReportFresh],
            ['Report Tx Hash', reportTxHash ?? 'N/A'],
            ['Can Finalize', canFinalize],
            ['Finalization Requested', !skipFinalize && canFinalize],
            ['Total Unfinalized Requests', unfinalizedRequestsNumber],
            [
              'Total Unfinalized Assets',
              formatEther(unfinalizedAssets) + ' ETH',
            ],
            ['Finalization Tx Hash', finalizationTxHash ?? 'N/A'],
            ['Requests Finalized', requestsFinalized],
            ['Assets Finalized', formatEther(assetsFinalized) + ' ETH'],
          ],
        });

        if (callbackUrl) {
          const { error } = await tryFetchPost(callbackUrl, {
            poolAddress: address,
            vaultAddress: vaultAddress,
            isConnected: isConnected,
            wasReportFresh: isReportFresh,
            reportSubmitted: !skipReport && isConnected && !isReportFresh,
            reportTxHash,
            canFinalize,
            finalizationRequested: !skipFinalize && canFinalize,
            finalizationTxHash,
            totalUnfinalizedRequests: unfinalizedRequestsNumber,
            totalUnfinalizedAssets: unfinalizedAssets,
            requestsFinalized,
            assetsFinalized,
          });
          if (error) {
            logError(`Failed to send callback to ${callbackUrl}: ${error}`);
          }
        }
      };

      // dry run to submit report & finalize withdrawals immediately if possible
      logInfo(
        'Performing initial dry-run in case report is already available...',
      );
      await onNewReport([]);

      logInfo('Starting watching for reports...');
      lazyOracle.watchEvent.VaultsReportDataUpdated(
        {},
        {
          onLogs: () => void onNewReport,
          batch: false,

          poll: true,
          strict: true,
          pollingInterval,
          onError: (error) => {
            logError(
              `Error while watching VaultsReportDataUpdated events: ${error}`,
            );
            if (callbackUrl) {
              void tryFetchPost(callbackUrl, {
                error: `Error while watching VaultsReportDataUpdated events: ${error}`,
              }).then(({ error }) => {
                if (error) {
                  logError(
                    `Failed to send error callback to ${callbackUrl}: ${error}`,
                  );
                }
              });
            }

            process.exit(1);
          },
        },
      );
      // empty await to keep the process alive
      await new Promise(() => {});
    },
  );
