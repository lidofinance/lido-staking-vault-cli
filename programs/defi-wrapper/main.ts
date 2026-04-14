import { Address, formatEther, formatUnits } from 'viem';
import { program } from 'command';
import { logInfo, logTable, logResult, formatBP, stringToAddress } from 'utils';
import { getPoolInfo } from 'features/defi-wrapper/index.js';

export const defiWrapper = program
  .command('defi-wrapper')
  .alias('dw')
  .description('defi wrapper commands');

defiWrapper
  .command('info')
  .description('get pool contract addresses and state')
  .argument('<address>', 'pool address', stringToAddress)
  .action(async (address: Address) => {
    const poolInfo = await getPoolInfo(address);

    logResult({});
    logInfo('Wrapper Info');
    logTable({
      data: [
        ['Vault', poolInfo.vault],
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
        ['Total Liability in stETH', poolInfo.totalLiabilitySteth],
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
        ['Decimals', poolInfo.decimals],
        ['Is Deposits Paused', poolInfo.isDepositsPaused],
        typeof poolInfo.isMintingPaused === 'boolean'
          ? ['Is Minting Paused', poolInfo.isMintingPaused]
          : undefined,
        ['Is Report Fresh', poolInfo.isReportFresh],
        ['ALLOW_LIST_ENABLED', poolInfo.ALLOW_LIST_ENABLED],
        ['Allow List Size', poolInfo.allowListSize],
        poolInfo.isInSync !== undefined
          ? [
              'Requires Vault Params Sync',
              poolInfo.isInSync
                ? '✅ No'
                : '❌ Yes (🚨 run "sync-vault-params" command)',
            ]
          : undefined,
      ].filter((item) => item !== undefined),
    });
  });
