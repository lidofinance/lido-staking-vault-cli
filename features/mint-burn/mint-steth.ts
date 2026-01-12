import { Address } from 'viem';

import { DashboardContract, getStethContract } from 'contracts';
import {
  fetchAndCalculateVaultHealthWithNewValue,
  showSpinner,
  confirmMint,
  callReadMethodSilent,
} from 'utils';
import {
  callWriteMethodsWithReportFresh,
  checkMintingCapacity,
} from 'features';

export const mintSteth = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfSteth: bigint,
  vault: Address,
) => {
  const stethContract = await getStethContract();
  const amountOfShares = await callReadMethodSilent({
    contract: stethContract,
    methodName: 'getSharesByPooledEth',
    payload: [[amountOfSteth]],
  });

  const isMintingCapacityOk = await checkMintingCapacity(
    contract,
    amountOfShares,
  );
  if (!isMintingCapacityOk) return;

  const hideSpinner = showSpinner();
  const {
    currentVaultHealth,
    newVaultHealth,
    newLiabilityShares,
    newLiabilitySharesInStethWei,
    liabilityShares,
    liabilitySharesInStethWei,
    valueInStethWei,
  } = await fetchAndCalculateVaultHealthWithNewValue(
    contract,
    amountOfShares,
    'mint',
  );
  hideSpinner();

  const confirm = await confirmMint({
    vaultAddress: vault,
    recipient,
    amountOfMint: amountOfShares,
    amountOfMintInStethWei: valueInStethWei,
    newLiabilityShares: newLiabilityShares,
    newLiabilitySharesInStethWei: newLiabilitySharesInStethWei,
    currentLiabilityShares: liabilityShares,
    currentLiabilitySharesInStethWei: liabilitySharesInStethWei,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
    type: 'stETH',
  });
  if (!confirm) return;

  await callWriteMethodsWithReportFresh({
    vault,
    contract,
    methodName: 'mintStETH',
    payload: [recipient, amountOfSteth],
  });
};
