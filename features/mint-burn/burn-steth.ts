import { Address } from 'viem';

import { DashboardContract, getStethContract } from 'contracts';
import {
  fetchAndCalculateVaultHealthWithNewValue,
  showSpinner,
  confirmBurn,
  callWriteMethodWithReceipt,
  callReadMethodSilent,
} from 'utils';
import { checkLiabilityShares } from 'features';

export const burnSteth = async (
  contract: DashboardContract,
  amountOfSteth: bigint,
  vault: Address,
) => {
  const stethContract = await getStethContract();
  const amountOfShares = await callReadMethodSilent(
    stethContract,
    'getSharesByPooledEth',
    [amountOfSteth],
  );

  const isLiabilitySharesOk = await checkLiabilityShares(
    contract,
    amountOfShares,
  );
  if (!isLiabilitySharesOk) return;

  const hideSpinner = showSpinner();
  const {
    currentVaultHealth,
    newVaultHealth,
    newLiabilityShares,
    newLiabilitySharesInStethWei,
    valueInStethWei,
    liabilityShares,
    liabilitySharesInStethWei,
  } = await fetchAndCalculateVaultHealthWithNewValue(
    contract,
    amountOfShares,
    'burn',
  );
  hideSpinner();

  const confirm = await confirmBurn({
    vaultAddress: vault,
    amountOfBurn: amountOfSteth,
    amountOfBurnInStethWei: valueInStethWei,
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

  await callWriteMethodWithReceipt({
    contract,
    methodName: 'burnStETH',
    payload: [amountOfSteth],
  });
};
