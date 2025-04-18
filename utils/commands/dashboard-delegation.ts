import { callWriteMethodWithReceipt, confirmBurn } from 'utils';

import { Address } from 'viem';

import { DashboardContract, DelegationContract } from 'contracts';
import {
  callReadMethod,
  fetchAndCalculateVaultHealthWitNewValue,
  logError,
  showSpinner,
  confirmMint,
} from 'utils';

export const mintShares = async (
  contract: DashboardContract | DelegationContract,
  recipient: Address,
  amountOfShares: bigint,
) => {
  const projectedNewMintableShares = await callReadMethod(
    contract,
    'projectedNewMintableShares',
    [0n],
  );
  if (projectedNewMintableShares < amountOfShares) {
    logError(
      `Cannot mint more shares than the vault can mint. Mintable: ${projectedNewMintableShares}`,
    );
    return;
  }

  const hideSpinner = showSpinner();

  const { currentVaultHealth, newVaultHealth, newMinted, minted } =
    await fetchAndCalculateVaultHealthWitNewValue(
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
    newMintedShares: newMinted,
    currentMintedShares: minted,
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
  contract: DashboardContract | DelegationContract,
  amountOfShares: bigint,
) => {
  const minted = await callReadMethod(contract, 'sharesMinted');

  if (amountOfShares > minted) {
    logError('Cannot burn more shares than the vault has');
    return;
  }

  const hideSpinner = showSpinner();

  const { currentVaultHealth, newVaultHealth, newMinted } =
    await fetchAndCalculateVaultHealthWitNewValue(
      contract,
      amountOfShares,
      'burn',
    );
  const vault = await callReadMethod(contract, 'stakingVault');
  hideSpinner();

  const confirm = await confirmBurn({
    vaultAddress: vault,
    amountOfBurn: amountOfShares,
    newMintedShares: newMinted,
    currentMintedShares: minted,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt(contract, 'burnShares', [amountOfShares]);
};
