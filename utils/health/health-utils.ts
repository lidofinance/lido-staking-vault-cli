import { formatEther } from 'viem';

import { callReadMethodSilent } from 'utils';
import { DashboardContract, getStethContract } from 'contracts';

import { calculateHealth } from './calculate-health.js';

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
    'getPooledEthBySharesRoundUp',
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

export const fetchAndCalculateVaultHealth = async (
  contract: DashboardContract,
) => {
  const {
    totalValue,
    forceRebalanceThresholdBP,
    liabilitySharesInStethWei,
    liabilityShares,
  } = await fetchVaultMetrics(contract);
  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });

  return {
    healthRatio,
    isHealthy,
    totalValue,
    totalValueInEth: formatEther(totalValue),
    liabilitySharesInStethWei,
    liabilitySharesInSteth: formatEther(liabilitySharesInStethWei),
    forceRebalanceThresholdBP,
    liabilitySharesInWei: liabilityShares,
    liabilityShares: formatEther(liabilityShares),
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
    callReadMethodSilent(stethContract, 'getPooledEthBySharesRoundUp', [
      newLiabilityShares,
    ]),
    callReadMethodSilent(stethContract, 'getPooledEthBySharesRoundUp', [value]),
  ]);

  const currentVaultHealth = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });
  const newVaultHealth = calculateHealth({
    totalValue,
    liabilitySharesInStethWei: newLiabilitySharesInStethWei,
    forceRebalanceThresholdBP,
  });

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
