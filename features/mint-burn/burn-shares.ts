import { Address } from 'viem';

import { DashboardContract } from 'contracts';
import {
  fetchAndCalculateVaultHealthWithNewValue,
  showSpinner,
  confirmBurn,
  callWriteMethodWithReceipt,
} from 'utils';
import { checkLiabilityShares } from 'features';

export const burnShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
  vault: Address,
  method: 'burnShares' | 'burnWstETH',
) => {
  const type = method === 'burnShares' ? 'shares' : 'wstETH';

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
    amountOfBurn: amountOfShares,
    amountOfBurnInStethWei: valueInStethWei,
    newLiabilityShares: newLiabilityShares,
    newLiabilitySharesInStethWei: newLiabilitySharesInStethWei,
    currentLiabilityShares: liabilityShares,
    currentLiabilitySharesInStethWei: liabilitySharesInStethWei,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
    type,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt({
    contract,
    methodName: method,
    payload: [amountOfShares],
  });
};
