import { DashboardContract, getStethContract } from 'contracts';
import { formatEther } from 'viem';
import { showSpinner } from './spinner/index.js';

export const fetchVaultMetrics = async (contract: DashboardContract) => {
  const stethContract = await getStethContract();

  const [totalValue, liabilityShares, forceRebalanceThresholdBP] =
    await Promise.all([
      contract.read.totalValue(), // BigInt, in wei
      contract.read.liabilityShares(), // BigInt, in shares
      contract.read.forcedRebalanceThresholdBP(), // number (in basis points)
    ]);

  const liabilitySharesInStethWei =
    await stethContract.read.getPooledEthByShares([liabilityShares]); // BigInt

  return {
    totalValue,
    liabilityShares,
    forceRebalanceThresholdBP,
    liabilitySharesInStethWei,
    stethContract,
  };
};

export const calculateVaultHealth = (
  totalValue: bigint,
  liabilitySharesInStethWei: bigint,
  forceRebalanceThresholdBP: number,
) => {
  // Convert everything to BigInt and perform calculations with 1e18 precision
  const BASIS_POINTS_DENOMINATOR = 10_000n;
  const PRECISION = 10n ** 18n;

  const thresholdMultiplier =
    ((BASIS_POINTS_DENOMINATOR - BigInt(forceRebalanceThresholdBP)) *
      PRECISION) /
    BASIS_POINTS_DENOMINATOR;
  const adjustedValuation = (totalValue * thresholdMultiplier) / PRECISION;

  const healthRatio18 =
    liabilitySharesInStethWei > 0n
      ? (adjustedValuation * PRECISION * 100n) / liabilitySharesInStethWei
      : Infinity;
  const healthRatio = Number(healthRatio18) / 1e18;

  // Convert to readable format
  const isHealthy = healthRatio >= 100;

  return {
    healthRatio,
    healthRatio18,
    isHealthy,
  };
};

export const fetchAndCalculateVaultHealth = async (
  contract: DashboardContract,
) => {
  const hideSpinner = showSpinner();
  const {
    totalValue,
    forceRebalanceThresholdBP,
    liabilitySharesInStethWei,
    liabilityShares,
  } = await fetchVaultMetrics(contract);
  const { healthRatio, isHealthy } = calculateVaultHealth(
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  );

  hideSpinner();

  return {
    healthRatio,
    isHealthy,
    totalValue,
    totalValueInEth: `${formatEther(totalValue)} ETH`,
    liabilitySharesInStethWei,
    liabilitySharesInSteth: `${formatEther(liabilitySharesInStethWei)} stETH`,
    forceRebalanceThresholdBP,
    liabilityShares,
  };
};

export const fetchAndCalculateVaultHealthWithNewValue = async (
  contract: DashboardContract,
  newMintedValue: bigint,
  type: 'mint' | 'burn',
) => {
  const {
    totalValue,
    forceRebalanceThresholdBP,
    liabilitySharesInStethWei,
    stethContract,
    liabilityShares,
  } = await fetchVaultMetrics(contract);
  const isMinting = type === 'mint';

  const newLiabilityShares = isMinting
    ? liabilityShares + newMintedValue
    : liabilityShares - newMintedValue;
  const newLiabilitySharesInStethWei =
    await stethContract.read.getPooledEthByShares([newLiabilityShares]); // BigInt

  const currentVaultHealth = calculateVaultHealth(
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  );
  const newVaultHealth = calculateVaultHealth(
    totalValue,
    newLiabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  );

  return {
    currentVaultHealth,
    newVaultHealth,
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
    liabilityShares,
    newLiabilityShares,
    newLiabilitySharesInStethWei,
  };
};
