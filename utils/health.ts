import { DashboardContract, getStethContract } from 'contracts';
import { formatEther } from 'viem';
import { callReadMethodSilent } from './contract.js';

/*
  Fetch vault metrics from the contract
*/
export const fetchVaultMetrics = async (contract: DashboardContract) => {
  const stethContract = await getStethContract();

  const [totalValue, liabilityShares, forceRebalanceThresholdBP] =
    await Promise.all([
      callReadMethodSilent(contract, 'totalValue'), // BigInt, in wei
      callReadMethodSilent(contract, 'liabilityShares'), // BigInt, in shares
      callReadMethodSilent(contract, 'forcedRebalanceThresholdBP'), // number (in basis points)
    ]);

  const liabilitySharesInStethWei = await callReadMethodSilent(
    stethContract,
    'getPooledEthByShares',
    [liabilityShares],
  ); // BigInt

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

  return {
    healthRatio,
    isHealthy,
    totalValue,
    totalValueInEth: `${formatEther(totalValue)} ETH`,
    liabilitySharesInStethWei,
    liabilitySharesInSteth: `${formatEther(liabilitySharesInStethWei)} stETH`,
    forceRebalanceThresholdBP,
    liabilitySharesInWei: liabilityShares,
    liabilityShares: `${formatEther(liabilityShares)} Shares`,
  };
};

export const fetchAndCalculateVaultHealthWithNewValue = async (
  contract: DashboardContract,
  value: bigint,
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
    ? liabilityShares + value
    : liabilityShares - value;
  const [newLiabilitySharesInStethWei, valueInStethWei] = await Promise.all([
    callReadMethodSilent(stethContract, 'getPooledEthByShares', [
      newLiabilityShares,
    ]),
    callReadMethodSilent(stethContract, 'getPooledEthByShares', [value]),
  ]);

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
    valueInStethWei,
  };
};
