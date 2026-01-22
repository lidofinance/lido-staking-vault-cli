import { formatEther } from 'viem';

import { callReadMethodSilent } from 'utils';
import { DashboardContract, getStethContract, StethContract } from 'contracts';

import { calculateHealth } from './calculate-health.js';

export const fetchVaultMetrics = async (
  contract: DashboardContract,
): Promise<{
  totalValue: bigint;
  liabilityShares: bigint;
  forcedRebalanceThresholdBP: number;
  liabilitySharesInStethWei: bigint;
  stethContract: StethContract;
}> => {
  const stethContract = await getStethContract();

  const [totalValue, liabilityShares, vaultConnection] = await Promise.all([
    callReadMethodSilent({ contract, methodName: 'totalValue', payload: [] }), // BigInt, in wei
    callReadMethodSilent({
      contract,
      methodName: 'liabilityShares',
      payload: [],
    }), // BigInt, in shares
    callReadMethodSilent({
      contract,
      methodName: 'vaultConnection',
      payload: [],
    }),
  ]);

  const { forcedRebalanceThresholdBP } = vaultConnection;

  const liabilitySharesInStethWei = await callReadMethodSilent({
    contract: stethContract,
    methodName: 'getPooledEthBySharesRoundUp',
    payload: [[liabilityShares]],
  }); // BigInt

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
    callReadMethodSilent({
      contract: stethContract,
      methodName: 'getPooledEthBySharesRoundUp',
      payload: [[newLiabilityShares]],
    }),
    callReadMethodSilent({
      contract: stethContract,
      methodName: 'getPooledEthByShares',
      payload: [[value]],
    }),
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
