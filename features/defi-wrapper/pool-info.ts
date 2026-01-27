import { Address, fromHex } from 'viem';
import {
  getStvStethPoolContract,
  getStvPoolContract,
  getWithdrawalQueueContract,
} from 'contracts/defi-wrapper/index.js';
import { callReadMethodSilent, fetchAndCalculateVaultHealth } from 'utils';
import { reportFreshWarning, vaultMintLimit } from 'features';
import { getDashboardContract, getStakingVaultContract } from 'contracts';
import { bigIntMax } from 'utils/bigInt.js';

export const STV_POOL_NAME = 'StvPool';
export const STV_STETH_POOL_NAME = 'StvStETHPool';
export const STV_STRATEGY_POOL_NAME = 'StvStrategyPool';

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

  const wqContract = await getWithdrawalQueueContract(WithdrawalQueue);
  const vaultContract = await getStakingVaultContract(vault);

  const [isDepositsPaused, unfinalizedAssets, availableVaultBalance] =
    await Promise.all([
      contract.read.isFeaturePaused([DEPOSITS_FEATURE]),
      wqContract.read.unfinalizedAssets(),
      vaultContract.read.availableBalance(),
    ]);

  const availableAssetsForCLDeposit = bigIntMax(
    availableVaultBalance - unfinalizedAssets,
    0n,
  );

  const isReportFresh = await reportFreshWarning(vault);

  const {
    healthRatio,
    isHealthy,
    liabilitySharesInSteth: totalLiabilitySteth,
  } = await fetchAndCalculateVaultHealth(await getDashboardContract(Dashboard));

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
    totalLiabilitySteth,
    healthRatio,
    isHealthy,
    totalUnassignedLiabilityShares,
    totalUnassignedLiabilitySteth,
    unfinalizedAssets,
    availableVaultBalance,
    decimals,
    isDepositsPaused,
    ALLOW_LIST_ENABLED,
    DEPOSITS_FEATURE,
    allowListSize,
    isReportFresh,
    availableAssetsForCLDeposit,
  };
};

export const areVaultParamsInSync = async (poolAddress: Address) => {
  const pool = await getStvStethPoolContract(poolAddress);

  const poolType = await pool.read.poolType();

  const dashboardAddress = await pool.read.DASHBOARD();

  const dashboard = await getDashboardContract(dashboardAddress);

  const poolTypeName = fromHex(poolType, 'string').replace(/\W/g, '');

  const isStvStethPool =
    poolTypeName === STV_STETH_POOL_NAME ||
    poolTypeName === STV_STRATEGY_POOL_NAME;

  if (!isStvStethPool) {
    throw new Error(
      `The pool at address ${poolAddress} is not an StvStEth or StvStrategy pool. This operation is only applicable to StvStEth and StvStrategy pools.`,
    );
  }

  const [
    {
      reserveRatioBP: vaultReserveRatioBP,
      forcedRebalanceThresholdBP: vaultForcedRebalanceThresholdBP,
    },
    poolForcedRebalanceThresholdBP,
    poolReserveRatioBP,
    RESERVE_RATIO_GAP_BP,
  ] = await Promise.all([
    dashboard.read.vaultConnection(),
    pool.read.poolForcedRebalanceThresholdBP(),
    pool.read.poolReserveRatioBP(),
    pool.read.RESERVE_RATIO_GAP_BP(),
  ]);

  const isInSync =
    poolReserveRatioBP == BigInt(vaultReserveRatioBP) + RESERVE_RATIO_GAP_BP &&
    poolForcedRebalanceThresholdBP ==
      BigInt(vaultForcedRebalanceThresholdBP) + RESERVE_RATIO_GAP_BP;

  return isInSync;
};

const getStvStethPoolInfo = async (address: Address) => {
  const contract = await getStvStethPoolContract(address);

  const [
    WSTETH,
    DASHBOARD,
    RESERVE_RATIO_GAP_BP,
    totalMintedStethShares,
    poolReserveRatioBP,
    poolForcedRebalanceThresholdBP,
    totalExceedingMintedStethShares,
    totalExceedingMintedSteth,
    maxLossSocializationBP,
    MINTING_FEATURE,
  ] = await Promise.all([
    contract.read.WSTETH(),
    contract.read.DASHBOARD(),
    contract.read.RESERVE_RATIO_GAP_BP(),
    contract.read.totalMintedStethShares(),
    contract.read.poolReserveRatioBP(),
    contract.read.poolForcedRebalanceThresholdBP(),
    contract.read.totalExceedingMintedStethShares(),
    contract.read.totalExceedingMintedSteth(),
    contract.read.maxLossSocializationBP(),
    contract.read.MINTING_FEATURE(),
  ]);

  const isMintingPaused = await callReadMethodSilent({
    contract,
    methodName: 'isFeaturePaused',
    payload: [[MINTING_FEATURE]],
  });

  const {
    liabilityShares,
    remainingMintingCapacityShares,
    totalMintingCapacityShares,
  } = await vaultMintLimit(await getDashboardContract(DASHBOARD));

  const isInSync = await areVaultParamsInSync(address);

  return {
    WSTETH,
    DASHBOARD,
    RESERVE_RATIO_GAP_BP,
    totalMintedStethShares,
    poolReserveRatioBP,
    poolForcedRebalanceThresholdBP,
    totalExceedingMintedStethShares,
    totalExceedingMintedSteth,
    liabilityShares,
    remainingMintingCapacityShares,
    totalMintingCapacityShares,
    maxLossSocializationBP,
    isMintingPaused,
    MINTING_FEATURE,
    isInSync,
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
