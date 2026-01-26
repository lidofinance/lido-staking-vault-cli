import { Address, formatEther, formatUnits } from 'viem';
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
} from 'utils';
import { getPoolInfo } from 'features/defi-wrapper/index.js';
import { checkIsReportFresh } from 'features';
import {
  getStvPoolContract,
  getWithdrawalQueueContract,
} from 'contracts/defi-wrapper/index.js';

import { wrapperOperations } from './main.js';
import { getDashboardContract, getStethContract } from 'contracts';
import { bigIntMin } from 'utils/bigInt.js';
import { getPublicClient } from 'providers';

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

    logResult({});
    logInfo('Wrapper Info');
    logTable({
      data: [
        ['Vault', poolInfo.vault],
        ['StETH', poolInfo.stETH],
        poolInfo.WSTETH && ['WSTETH', poolInfo.WSTETH],
        ['Dashboard', poolInfo.Dashboard],
        ['VaultHub', poolInfo.VaultHub],
        ['WithdrawalQueue', poolInfo.WithdrawalQueue],
        ['Distributor', poolInfo.Distributor],
        ['PoolType', poolInfo.poolTypeName],
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
        ['Total Liability Shares', formatEther(poolInfo.totalLiabilityShares)],
        typeof poolInfo.totalMintedStethShares === 'bigint'
          ? [
              'Total Minted Steth Shares',
              formatEther(poolInfo.totalMintedStethShares),
            ]
          : undefined,
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
        [
          'Total Unassigned Liability Shares',
          formatEther(poolInfo.totalUnassignedLiabilityShares),
        ],
        [
          'Total Unassigned Liability Steth',
          formatEther(poolInfo.totalUnassignedLiabilitySteth),
        ],
        ['Decimals', poolInfo.decimals],
        ['Is Deposits Paused', poolInfo.isDepositsPaused],
        typeof poolInfo.isMintingPaused === 'boolean'
          ? ['Is Minting Paused', poolInfo.isMintingPaused]
          : undefined,
        ['Is Report Fresh', poolInfo.isReportFresh],
        ['ALLOW_LIST_ENABLED', poolInfo.ALLOW_LIST_ENABLED],
        ['Allow List Size', poolInfo.allowListSize],
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
  .argument('<address>', 'wrapper address', stringToAddress)
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

const finalizationBlocker = (amount: bigint) => {
  return amount <= 0n ? '❌' : '✅';
};

wrapperOperationsRead
  .command('withdrawal-status')
  .description('get status of withdrawal queue')
  .argument('<address>', 'wrapper address', stringArrayToAddressArray)
  .action(async (address: Address) => {
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

    const { isFresh: isReportFresh } = await checkIsReportFresh({
      vault: vaultAddress,
    });

    const logData: [string, any][] = [
      ['Pool Address', address],
      ['Withdrawal Queue Address', withdrawalQueueAddress],
      ['Vault Address', vaultAddress],
      [
        'Is Report Fresh',
        isReportFresh ? '✅ Yes' : '❌ No( 🚨 Some data might be stale)',
      ],
    ];

    const withdrawableEther = await callReadMethodSilent({
      contract: dashboard,
      methodName: 'withdrawableValue',
      payload: [],
    });

    const lastRequestId = await callReadMethodSilent({
      contract: withdrawalQueue,
      methodName: 'getLastRequestId',
      payload: [],
    });

    const lastFinalizedRequestId = await callReadMethodSilent({
      contract: withdrawalQueue,
      methodName: 'getLastRequestId',
      payload: [],
    });

    const requestsToFinalize = await callReadMethodSilent({
      contract: withdrawalQueue,
      methodName: 'unfinalizedRequestsNumber',
      payload: [],
    });

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

    const unfinalizedStethShares = await callReadMethodSilent({
      contract: withdrawalQueue,
      methodName: 'unfinalizedStethShares',
      payload: [],
    });

    const unfinalizedSteth = await callReadMethodSilent({
      contract: await getStethContract(),
      methodName: 'getPooledEthBySharesRoundUp',
      payload: [[unfinalizedStethShares]],
    });

    const unfinalizedAssets = await callReadMethodSilent({
      contract: withdrawalQueue,
      methodName: 'unfinalizedAssets',
      payload: [],
    });

    const ethForFinalization = bigIntMin(withdrawableEther, unfinalizedAssets);

    const ethToWithdrawFromCL = unfinalizedAssets - ethForFinalization;

    const canFinalize =
      isReportFresh && requestsToFinalize > 0n && ethForFinalization > 0n;

    logData.push(
      ['Last Finalized Request ID', lastFinalizedRequestId],
      ['Last Request ID', lastRequestId],
      [
        'Requests to Finalize',
        requestsToFinalize + finalizationBlocker(requestsToFinalize),
      ],
      ['Unfinalized STV', formatUnits(unfinalizedStv, stvDecimals)],
      ['Unfinalized Steth Shares', formatEther(unfinalizedStethShares)],
      ['Unfinalized Steth', formatEther(unfinalizedSteth)],
      [
        'Unfinalized ETH',
        formatEther(unfinalizedAssets) + finalizationBlocker(unfinalizedAssets),
      ],
      [
        'Buffered ETH',
        formatEther(withdrawableEther) + finalizationBlocker(withdrawableEther),
      ],
      [
        'ETH Available for Finalization',
        formatEther(ethForFinalization) +
          finalizationBlocker(ethForFinalization),
      ],
      ['ETH to Withdraw from CL', formatEther(ethToWithdrawFromCL)],
      [
        'Can Finalize Now',
        canFinalize ? '✅ Yes' : '❌ No (🚨 Check above parameters)',
      ],
    );

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
