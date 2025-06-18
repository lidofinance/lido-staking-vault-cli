import { Address } from 'viem';

import { DashboardContract } from 'contracts';
import {
  fetchAndCalculateVaultHealthWithNewValue,
  showSpinner,
  confirmMint,
  callWriteMethodWithReceipt,
} from 'utils';
import { checkIsReportFresh, checkMintingCapacity } from 'features';

export const mintShares = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfShares: bigint,
  vault: Address,
  method: 'mintShares' | 'mintWstETH',
) => {
  const type = method === 'mintShares' ? 'shares' : 'wstETH';

  const isReportFresh = await checkIsReportFresh(vault);
  if (!isReportFresh) return;

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
    type,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt({
    contract,
    methodName: method,
    payload: [recipient, amountOfShares],
  });
};
