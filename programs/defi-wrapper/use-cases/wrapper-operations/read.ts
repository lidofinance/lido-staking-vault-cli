import { Address, formatEther, formatUnits, zeroAddress } from 'viem';
import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  logTable,
  logResult,
  formatBP,
  callReadMethodSilent,
  stringArrayToAddressArray,
  logError,
} from 'utils';
import { getPoolInfo } from 'features/defi-wrapper/index.js';
import { checkIsReportFresh } from 'features';
import {
  getStvPoolContract,
  getWithdrawalQueueContract,
} from 'contracts/defi-wrapper/index.js';

import { wrapperOperations } from './main.js';
import { getDashboardContract, getStethContract } from 'contracts';
import { bigIntMin } from 'utils/big-int.js';
import { getPublicClient } from 'providers';
import { getExplorerUrl } from 'configs/deployed.js';

const wrapperOperationsRead = wrapperOperations
  .command('read')
  .aliases(['r'])
  .description('wrapper operations read commands');

wrapperOperationsRead.addOption(new Option('-cmd2json'));
wrapperOperationsRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(wrapperOperationsRead));
  process.exit();
});

wrapperOperationsRead
  .command('info')
  .description('get wrapper info')
  .argument('<address>', 'wrapper address', stringToAddress)
  .action(async (address: Address) => {
    const poolInfo = await getPoolInfo(address);

    logInfo('Wrapper Info');
    logTable({
      explorerBaseUrl: await getExplorerUrl(),
      data: [
        // Base Info
        ['Pool', address],
        ['PoolType', poolInfo.poolTypeName],
        ['Vault', poolInfo.vault],
        ['Dashboard', poolInfo.Dashboard],
        ['WithdrawalQueue', poolInfo.WithdrawalQueue],
        ['Distributor', poolInfo.Distributor],

        // Strategies
        ...(poolInfo.strategies?.flatMap((strategy, index) => [
          [`Strategy ${index + 1} Address`, strategy.address],
          [`Strategy ${index + 1} Name`, strategy.strategyName ?? 'N/A'],
          [`Strategy ${index + 1} ID`, strategy.strategyId ?? 'N/A'],
          [
            `Strategy ${index + 1} Allow List Enabled`,
            strategy.isAllowListEnabled ?? 'N/A',
          ],
          ...(strategy.isAllowListEnabled && strategy.allowListMangers
            ? strategy.allowListMangers.map((manager, managerIndex) => [
                `Strategy ${index + 1} Allow List Manager ${managerIndex + 1}`,
                manager,
              ])
            : []),
        ]) ?? []),

        // Economic Parameters
        typeof poolInfo.RESERVE_RATIO_GAP_BP === 'bigint'
          ? ['RESERVE_RATIO_GAP_BP', poolInfo.RESERVE_RATIO_GAP_BP]
          : undefined,
        typeof poolInfo.poolReserveRatioBP === 'bigint'
          ? [
              'Reserve Ratio, BP',
              `${poolInfo.poolReserveRatioBP} (${formatBP(poolInfo.poolReserveRatioBP)})`,
            ]
          : undefined,
        typeof poolInfo.poolForcedRebalanceThresholdBP === 'bigint'
          ? [
              'Forced Rebalance Threshold, BP',
              `${poolInfo.poolForcedRebalanceThresholdBP} (${formatBP(poolInfo.poolForcedRebalanceThresholdBP)})`,
            ]
          : undefined,
        typeof poolInfo.maxLossSocializationBP === 'bigint'
          ? [
              'Max Loss Socialization, BP',
              `${poolInfo.maxLossSocializationBP} (${formatBP(poolInfo.maxLossSocializationBP)})`,
            ]
          : undefined,
        ['Total Nominal Assets', formatEther(poolInfo.totalNominalAssets)],
        ['Total Assets', formatEther(poolInfo.totalAssets)],
        ['Total Supply', formatUnits(poolInfo.totalSupply, poolInfo.decimals)],
        typeof poolInfo.totalMintingCapacityShares === 'bigint'
          ? [
              'Total Minting Capacity Steth Shares',
              formatEther(poolInfo.totalMintingCapacityShares),
            ]
          : undefined,
        typeof poolInfo.remainingMintingCapacityShares === 'bigint'
          ? [
              'Remaining Minting Capacity Steth Shares',
              formatEther(poolInfo.remainingMintingCapacityShares),
            ]
          : undefined,
        typeof poolInfo.totalMintedStethShares === 'bigint'
          ? [
              'Total Minted Steth Shares',
              formatEther(poolInfo.totalMintedStethShares),
            ]
          : undefined,
        typeof poolInfo.liabilityShares === 'bigint'
          ? ['Total Liability Shares', formatEther(poolInfo.liabilityShares)]
          : undefined,

        [
          'Total Liability in stETH',
          // already formatted
          poolInfo.totalLiabilitySteth,
        ],
        typeof poolInfo.totalExceedingMintedStethShares === 'bigint'
          ? [
              'Total Exceeding Minted Steth Shares',
              formatEther(poolInfo.totalExceedingMintedStethShares),
            ]
          : undefined,
        typeof poolInfo.totalExceedingMintedSteth === 'bigint'
          ? [
              'Total Exceeding Minted Steth',
              formatEther(poolInfo.totalExceedingMintedSteth),
            ]
          : undefined,
        ['Vault Healthy', poolInfo.isHealthy],
        ['Health Rate', `${poolInfo.healthRatio}%`],
        ['Unfinalized ETH', formatEther(poolInfo.unfinalizedAssets)],
        [
          'Available ETH for CL Deposit',
          formatEther(poolInfo.availableAssetsForCLDeposit),
        ],
        [
          'Total Unassigned Liability Shares',
          formatEther(poolInfo.totalUnassignedLiabilityShares),
        ],
        [
          'Total Unassigned Liability Steth',
          formatEther(poolInfo.totalUnassignedLiabilitySteth),
        ],
        // Configuration
        ['Decimals', poolInfo.decimals],
        ['Is Deposits Paused', poolInfo.isDepositsPaused],
        typeof poolInfo.isMintingPaused === 'boolean'
          ? ['Is Minting Paused', poolInfo.isMintingPaused]
          : undefined,
        ['Is Report Fresh', poolInfo.isReportFresh],
        ...(!poolInfo.isStrategyPool
          ? [
              ['ALLOW_LIST_ENABLED', poolInfo.ALLOW_LIST_ENABLED],
              ['Allow List Size', poolInfo.allowListSize],
            ]
          : []),
        poolInfo.isInSync !== undefined
          ? [
              'Requires Vault Params Sync',
              poolInfo.isInSync
                ? '✅ No'
                : '❌ Yes (🚨 run "sync-vault-params" command)',
            ]
          : undefined,
        ['DEPOSITS_FEATURE (ID)', poolInfo.DEPOSITS_FEATURE],
        poolInfo.MINTING_FEATURE
          ? ['MINTING_FEATURE (ID)', poolInfo.MINTING_FEATURE]
          : undefined,
      ].filter((item) => item !== undefined),
    });
  });

wrapperOperationsRead
  .command('allow-list')
  .description('get full or partial allow list data')
  .argument(
    '<poolAddress/strategyAddress>',
    'pool or strategy(for stvStrategyPools) address',
    stringToAddress,
  )
  .argument(
    '[addresses...]',
    'list of addresses to check, leave empty to get full allow list',
    stringArrayToAddressArray,
    [],
  )
  .action(async (poolAddress, addresses: Address[]) => {
    const pool = await getStvPoolContract(poolAddress);
    const publicClient = await getPublicClient();
    const isAllowListEnabled = await callReadMethodSilent({
      contract: pool,
      methodName: 'ALLOW_LIST_ENABLED',
      payload: [],
    });
    if (!isAllowListEnabled) {
      logInfo('Allow List is disabled for this pool');
      return;
    }

    const allowListManagerRole = await callReadMethodSilent({
      contract: pool,
      methodName: 'ALLOW_LIST_MANAGER_ROLE',
      payload: [],
    });

    const allowListManagers = await callReadMethodSilent({
      contract: pool,
      methodName: 'getRoleMembers',
      payload: [[allowListManagerRole]],
    });

    logTable({
      params: {
        head: ['List of holders of ALLOW_LIST_MANAGER_ROLE'],
      },
      data: allowListManagers.map((addr, index) => [
        `Allow List Manager ${index + 1}`,
        addr,
      ]),
    });

    const allowListSize = await callReadMethodSilent({
      contract: pool,
      methodName: 'getAllowListSize',
      payload: [],
    });
    logInfo(`Allow List contains ${allowListSize} addresses:`);

    if (addresses.length === 0) {
      const fullAllowList = await callReadMethodSilent({
        contract: pool,
        methodName: 'getAllowListAddresses',
        payload: [],
      });

      logTable({ data: fullAllowList.map((addr) => [addr]) });
    } else {
      const result = await publicClient.multicall({
        contracts: addresses.map(
          (address) =>
            ({
              address: pool.address,
              abi: pool.abi,
              functionName: 'isAllowListed',
              args: [address],
            }) as const,
        ),
        allowFailure: false,
      });

      logTable({
        data: result.map((isAllowed, index) => [
          addresses[index],
          isAllowed ? '✅ Allowed' : '❌ Not Allowed',
        ]),
      });
    }
  });

wrapperOperationsRead
  .command('report-fresh')
  .description('check if report is fresh')
  .argument('<address>', 'wrapper address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getStvPoolContract(address);
    const vault = await callReadMethodSilent({
      contract,
      methodName: 'VAULT',
      payload: [],
    });

    const { isFresh: isReportFresh } = await checkIsReportFresh({ vault });
    logResult({});
    logInfo('Report Fresh');
    logTable({
      data: [['Is Report Fresh', isReportFresh]],
    });
  });

const finalizationBlocker = (value: bigint | boolean | number) => {
  return ' ' + (!value ? '❌' : '✅');
};

wrapperOperationsRead
  .command('withdrawal-status')
  .description('get status of withdrawal queue')
  .argument('<address>', 'wrapper address', stringToAddress)
  .action(async (address: Address) => {
    const logData: [string, any][] = [];

    try {
      const pool = await getStvPoolContract(address);
      const withdrawalQueueAddress = await callReadMethodSilent({
        contract: pool,
        methodName: 'WITHDRAWAL_QUEUE',
        payload: [],
      });

      const vaultAddress = await callReadMethodSilent({
        contract: pool,
        methodName: 'VAULT',
        payload: [],
      });

      const dashboardAddress = await callReadMethodSilent({
        contract: pool,
        methodName: 'DASHBOARD',
        payload: [],
      });

      const dashboard = await getDashboardContract(dashboardAddress);
      const withdrawalQueue = await getWithdrawalQueueContract(
        withdrawalQueueAddress,
      );

      logData.push(
        ['Pool Address', address],
        ['Withdrawal Queue Address', withdrawalQueueAddress],
        ['Vault Address', vaultAddress],
      );

      const { isFresh: isReportFresh } = await checkIsReportFresh({
        vault: vaultAddress,
      });

      logData.push([
        'Is Report Fresh',
        (isReportFresh ? 'Yes' : 'No( 🚨 Some data might be stale)') +
          finalizationBlocker(isReportFresh),
      ]);

      const MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS',
        payload: [],
      });

      const MAX_WITHDRAWAL_ASSETS = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'MAX_WITHDRAWAL_ASSETS',
        payload: [],
      });

      const MIN_WITHDRAWAL_VALUE = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'MIN_WITHDRAWAL_VALUE',
        payload: [],
      });

      const finalizationGasCoverage = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'getFinalizationGasCostCoverage',
        payload: [],
      });

      logData.push(
        ['Max Withdrawal Assets', formatEther(MAX_WITHDRAWAL_ASSETS) + ' ETH'],
        ['Min Withdrawal Value', formatEther(MIN_WITHDRAWAL_VALUE) + ' ETH'],
        [
          'Finalization Gas Cost Coverage ',
          formatEther(finalizationGasCoverage) + ' ETH',
        ],
        [
          'Min Withdrawal Delay ',
          MIN_WITHDRAWAL_DELAY_TIME_IN_SECONDS + ' seconds',
        ],
      );

      const FINALIZE_FEATURE = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'FINALIZE_FEATURE',
        payload: [],
      });

      const isFinalizationPaused = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'isFeaturePaused',
        payload: [[FINALIZE_FEATURE]],
      });

      logData.push([
        'Is Finalization Paused',
        (isFinalizationPaused ? 'Yes' : 'No') +
          finalizationBlocker(!isFinalizationPaused),
      ]);

      const FINALIZER_ROLE = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'FINALIZE_ROLE',
        payload: [],
      });

      const finalizers = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'getRoleMembers',
        payload: [[FINALIZER_ROLE]],
      });

      logData.push([
        'Number of Finalizers',
        finalizers.length + finalizationBlocker(finalizers.length),
      ]);

      for (const [index, address] of finalizers.entries()) {
        logData.push([`Finalizer ${index + 1}`, address]);
      }

      const withdrawableEther = await callReadMethodSilent({
        contract: dashboard,
        methodName: 'withdrawableValue',
        payload: [],
      });

      logData.push([
        'Buffered ETH',
        formatEther(withdrawableEther) + finalizationBlocker(withdrawableEther),
      ]);

      const lastRequestId = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'getLastRequestId',
        payload: [],
      });

      logData.push(['Last Request ID', lastRequestId]);

      const lastFinalizedRequestId = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'getLastFinalizedRequestId',
        payload: [],
      });

      logData.push(['Last Finalized Request ID', lastFinalizedRequestId]);

      const requestsToFinalize = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'unfinalizedRequestsNumber',
        payload: [],
      });

      logData.push([
        'Requests to Finalize',
        requestsToFinalize + finalizationBlocker(requestsToFinalize),
      ]);

      const unfinalizedStv = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'unfinalizedStv',
        payload: [],
      });

      const stvDecimals = await callReadMethodSilent({
        contract: pool,
        methodName: 'decimals',
        payload: [],
      });

      logData.push([
        'Unfinalized STV',
        formatUnits(unfinalizedStv, stvDecimals),
      ]);

      const unfinalizedStethShares = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'unfinalizedStethShares',
        payload: [],
      });

      logData.push([
        'Unfinalized Steth Shares',
        formatEther(unfinalizedStethShares),
      ]);

      const unfinalizedSteth = await callReadMethodSilent({
        contract: await getStethContract(),
        methodName: 'getPooledEthBySharesRoundUp',
        payload: [[unfinalizedStethShares]],
      });

      logData.push(['Unfinalized Steth', formatEther(unfinalizedSteth)]);

      const unfinalizedAssets = await callReadMethodSilent({
        contract: withdrawalQueue,
        methodName: 'unfinalizedAssets',
        payload: [],
      });

      logData.push([
        'Unfinalized ETH',
        formatEther(unfinalizedAssets) + finalizationBlocker(unfinalizedAssets),
      ]);

      const ethForFinalization = bigIntMin(
        withdrawableEther,
        unfinalizedAssets,
      );

      logData.push([
        'ETH Available for Finalization',
        formatEther(ethForFinalization) +
          finalizationBlocker(ethForFinalization),
      ]);

      const ethToWithdrawFromCL = unfinalizedAssets - ethForFinalization;

      logData.push([
        'ETH to Withdraw from CL',
        formatEther(ethToWithdrawFromCL),
      ]);

      let canFinalize =
        !isFinalizationPaused &&
        finalizers.length > 0 &&
        isReportFresh &&
        requestsToFinalize > 0n &&
        ethForFinalization > 0n;

      if (canFinalize) {
        try {
          const { result: requestFinalized } =
            await withdrawalQueue.simulate.finalize(
              [requestsToFinalize, zeroAddress],
              {
                account: finalizers[0],
              },
            );

          logData.push([
            'Finalization Simulation',
            `requests finalized ${requestFinalized}/${requestsToFinalize} ${finalizationBlocker(requestFinalized)}`,
          ]);
        } catch (error) {
          canFinalize = false;
          logInfo(
            'Finalization simulation failed, finalization will not be possible',
            error,
          );
          logInfo(`Possible reasons for finalization failure: 
              - all requests were made too recently (withdrawal delay not passed)
              - all requests were made after the last report (next report needed)   
            `);
          logData.push([
            'Finalization Simulation',
            `🚨 Simulation failed ${finalizationBlocker(canFinalize)}`,
          ]);
        }
      }

      logData.push([
        'Can Finalize Now',
        canFinalize ? '✅ Yes' : '❌ No (🚨 Check above parameters)',
      ]);
    } catch (error) {
      logError(
        'Error fetching withdrawal status, displaying available data',
        error,
      );
    }

    logResult({ data: logData });
  });

// TODO: Add wrapper health command
// wrapperOperationsRead
//   .command('health')
//   .description('get wrapper health')
//   .argument('<address>', 'wrapper address', stringToAddress)
//   .action(async (address: Address) => {
//     const contract = await getStvPoolContract(address);
//     const [vault, dashboard] = await Promise.all([
//       callReadMethodSilent(contract, 'VAULT'),
//       callReadMethodSilent(contract, 'DASHBOARD'),
//     ]);
//     const dashboardContract = await getDashboardContract(dashboard);

//     await checkQuarantine(vault);
//     await getVaultHealthByDashboard(dashboardContract);
//   });
