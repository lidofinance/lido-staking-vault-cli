import { Address } from 'viem';

import { DashboardContract, getStethContract } from 'contracts';
import {
  fetchAndCalculateVaultHealthWithNewValue,
  showSpinner,
  confirmMint,
  callWriteMethodWithReceipt,
  callReadMethodSilent,
} from 'utils';
import { checkIsReportFresh, checkMintingCapacity } from 'features';

export const mintSteth = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfSteth: bigint,
  vault: Address,
) => {
  const stethContract = await getStethContract();
  const amountOfShares = await callReadMethodSilent(
    stethContract,
    'getSharesByPooledEth',
    [amountOfSteth],
  );

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
    type: 'stETH',
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt({
    contract,
    methodName: 'mintStETH',
    payload: [recipient, amountOfSteth],
  });
};
