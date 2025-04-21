import { callWriteMethodWithReceipt, confirmBurn } from 'utils';

import { Address } from 'viem';

import { DashboardContract } from 'contracts';
import {
  callReadMethod,
  fetchAndCalculateVaultHealthWithNewValue,
  logError,
  showSpinner,
  confirmMint,
} from 'utils';

export const mintShares = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfShares: bigint,
) => {
  const remainingMintingCapacity = await callReadMethod(
    contract,
    'remainingMintingCapacity',
    [0n],
  );
  if (remainingMintingCapacity < amountOfShares) {
    logError(
      `Cannot mint more shares than the vault can mint. Mintable: ${remainingMintingCapacity}`,
    );
    return;
  }

  const hideSpinner = showSpinner();

  const {
    currentVaultHealth,
    newVaultHealth,
    newLiabilityShares,
    liabilityShares,
  } = await fetchAndCalculateVaultHealthWithNewValue(
    contract,
    amountOfShares,
    'mint',
  );
  const vault = await callReadMethod(contract, 'stakingVault');
  hideSpinner();

  const confirm = await confirmMint({
    vaultAddress: vault,
    recipient,
    amountOfMint: amountOfShares,
    newLiabilityShares: newLiabilityShares,
    currentLiabilityShares: liabilityShares,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt(contract, 'mintShares', [
    recipient,
    amountOfShares,
  ]);
};

export const burnShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const liabilityShares = await callReadMethod(contract, 'liabilityShares');

  if (amountOfShares > liabilityShares) {
    logError('Cannot burn more shares than the vault has');
    return;
  }

  const hideSpinner = showSpinner();

  const { currentVaultHealth, newVaultHealth, newLiabilityShares } =
    await fetchAndCalculateVaultHealthWithNewValue(
      contract,
      amountOfShares,
      'burn',
    );
  const vault = await callReadMethod(contract, 'stakingVault');
  hideSpinner();

  const confirm = await confirmBurn({
    vaultAddress: vault,
    amountOfBurn: amountOfShares,
    newLiabilityShares: newLiabilityShares,
    currentLiabilityShares: liabilityShares,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt(contract, 'burnShares', [amountOfShares]);
};
