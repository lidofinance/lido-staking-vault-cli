import { Address, fromHex } from 'viem';
import {
  getStvStethPoolContract,
  getStvPoolContract,
} from 'contracts/defi-wrapper/index.js';
import { callReadMethodSilent } from 'utils';
import { reportFreshWarning } from 'features';

const STV_POOL_NAME = 'StvPool';
const STV_STETH_POOL_NAME = 'StvStETHPool';
const STV_STRATEGY_POOL_NAME = 'StvStrategyPool';

const getStvPoolInfo = async (address: Address) => {
  const contract = await getStvPoolContract(address);

  const [
    vault,
    stETH,
    Dashboard,
    VaultHub,
    WithdrawalQueue,
    Distributor,
    poolType,
    totalNominalAssets,
    totalAssets,
    totalSupply,
    totalLiabilityShares,
    totalUnassignedLiabilityShares,
    totalUnassignedLiabilitySteth,
    decimals,
    DEPOSITS_FEATURE,
    ALLOW_LIST_ENABLED,
    allowListSize,
  ] = await Promise.all([
    contract.read.VAULT(),
    contract.read.STETH(),
    contract.read.DASHBOARD(),
    contract.read.VAULT_HUB(),
    contract.read.WITHDRAWAL_QUEUE(),
    contract.read.DISTRIBUTOR(),
    contract.read.poolType(),
    contract.read.totalNominalAssets(),
    contract.read.totalAssets(),
    contract.read.totalSupply(),
    contract.read.totalLiabilityShares(),
    contract.read.totalUnassignedLiabilityShares(),
    contract.read.totalUnassignedLiabilitySteth(),
    contract.read.decimals(),
    contract.read.DEPOSITS_FEATURE(),
    contract.read.ALLOW_LIST_ENABLED(),
    contract.read.getAllowListSize(),
  ]);

  const isDepositsPaused = await callReadMethodSilent(
    contract,
    'isFeaturePaused',
    [DEPOSITS_FEATURE],
  );
  const isReportFresh = await reportFreshWarning(vault);

  return {
    vault,
    stETH,
    Dashboard,
    VaultHub,
    WithdrawalQueue,
    Distributor,
    poolType,
    totalNominalAssets,
    totalAssets,
    totalSupply,
    totalLiabilityShares,
    totalUnassignedLiabilityShares,
    totalUnassignedLiabilitySteth,
    decimals,
    isDepositsPaused,
    ALLOW_LIST_ENABLED,
    DEPOSITS_FEATURE,
    allowListSize,
    isReportFresh,
  };
};

const getStvStethPoolInfo = async (address: Address) => {
  const contract = await getStvStethPoolContract(address);

  const [
    WSTETH,
    RESERVE_RATIO_GAP_BP,
    totalMintedStethShares,
    reserveRatioBP,
    forcedRebalanceThresholdBP,
    totalExceedingMintedStethShares,
    totalExceedingMintedSteth,
    maxLossSocializationBP,
    MINTING_FEATURE,
  ] = await Promise.all([
    contract.read.WSTETH(),
    contract.read.RESERVE_RATIO_GAP_BP(),
    contract.read.totalMintedStethShares(),
    contract.read.reserveRatioBP(),
    contract.read.forcedRebalanceThresholdBP(),
    contract.read.totalExceedingMintedStethShares(),
    contract.read.totalExceedingMintedSteth(),
    contract.read.maxLossSocializationBP(),
    contract.read.MINTING_FEATURE(),
  ]);

  const isMintingPaused = await callReadMethodSilent(
    contract,
    'isFeaturePaused',
    [MINTING_FEATURE],
  );

  return {
    WSTETH,
    RESERVE_RATIO_GAP_BP,
    totalMintedStethShares,
    reserveRatioBP,
    forcedRebalanceThresholdBP,
    totalExceedingMintedStethShares,
    totalExceedingMintedSteth,
    maxLossSocializationBP,
    isMintingPaused,
    MINTING_FEATURE,
  };
};

export const getPoolInfo = async (address: Address) => {
  const stvPoolInfo = await getStvPoolInfo(address);

  const poolTypeName = fromHex(stvPoolInfo.poolType, 'string').replace(
    /\W/g,
    '',
  );

  const isStvStethPool =
    poolTypeName === STV_STETH_POOL_NAME ||
    poolTypeName === STV_STRATEGY_POOL_NAME;
  const isStvPool = poolTypeName === STV_POOL_NAME;

  const stvStethPoolInfo = isStvStethPool
    ? await getStvStethPoolInfo(address)
    : null;

  return {
    ...stvPoolInfo,
    ...(stvStethPoolInfo ? stvStethPoolInfo : {}),
    poolTypeName,
    isStvStethPool,
    isStvPool,
  };
};
