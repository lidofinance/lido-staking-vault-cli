import { Address, formatEther, formatUnits } from 'viem';
import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  logTable,
  logResult,
  formatBP,
} from 'utils';
import { getPoolInfo } from 'features/defi-wrapper/index.js';

import { wrapperOperations } from './main.js';

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
        typeof poolInfo.reserveRatioBP === 'bigint'
          ? [
              'Reserve Ratio, BP',
              `${poolInfo.reserveRatioBP} (${formatBP(poolInfo.reserveRatioBP)})`,
            ]
          : undefined,
        typeof poolInfo.forcedRebalanceThresholdBP === 'bigint'
          ? [
              'Forced Rebalance Threshold, BP',
              `${poolInfo.forcedRebalanceThresholdBP} (${formatBP(poolInfo.forcedRebalanceThresholdBP)})`,
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
