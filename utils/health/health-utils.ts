import { formatEther } from 'viem';

import { callReadMethodSilent } from 'utils';
import { DashboardContract, getStethContract } from 'contracts';

import { calculateHealth } from './calculate-health.js';

export const fetchVaultMetrics = async (contract: DashboardContract) => {
  const stethContract = await getStethContract();

  const [totalValue, liabilityShares, vaultConnection] = await Promise.all([
    callReadMethodSilent(contract, 'totalValue'), // BigInt, in wei
    callReadMethodSilent(contract, 'liabilityShares'), // BigInt, in shares
    callReadMethodSilent(contract, 'vaultConnection'),
  ]);

  const { forcedRebalanceThresholdBP } = vaultConnection;

  const liabilitySharesInStethWei = await callReadMethodSilent(
    stethContract,
    'getPooledEthBySharesRoundUp',
    [liabilityShares],
  ); // BigInt

  return {
    totalValue,
    liabilityShares,
    forcedRebalanceThresholdBP,
    liabilitySharesInStethWei,
    stethContract,
  };
};

export const fetchAndCalculateVaultHealth = async (
  contract: DashboardContract,
) => {
  const {
    totalValue,
    forcedRebalanceThresholdBP,
    liabilitySharesInStethWei,
    liabilityShares,
  } = await fetchVaultMetrics(contract);
  const { healthRatio, isHealthy } = calculateHealth({
    totalValue,
    liabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
  });

  return {
    healthRatio,
    isHealthy,
    totalValue,
    totalValueInEth: formatEther(totalValue),
    liabilitySharesInStethWei,
    liabilitySharesInSteth: formatEther(liabilitySharesInStethWei),
    forcedRebalanceThresholdBP,
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
    forcedRebalanceThresholdBP,
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
    forcedRebalanceThresholdBP,
  });
  const newVaultHealth = calculateHealth({
    totalValue,
    liabilitySharesInStethWei: newLiabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
  });

  return {
    currentVaultHealth,
    newVaultHealth,
    totalValue,
    liabilitySharesInStethWei,
    forcedRebalanceThresholdBP,
    liabilityShares,
    newLiabilityShares,
    newLiabilitySharesInStethWei,
    valueInStethWei,
  };
};
