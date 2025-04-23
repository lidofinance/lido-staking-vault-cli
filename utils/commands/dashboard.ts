import {
  callWriteMethodWithReceipt,
  confirmBurn,
  confirmOperation,
  getRequiredLockByShares,
} from 'utils';

import { Address, formatEther } from 'viem';

import { DashboardContract, getDashboardContract } from 'contracts';
import {
  callReadMethod,
  fetchAndCalculateVaultHealthWithNewValue,
  logError,
  showSpinner,
  confirmMint,
  logInfo,
} from 'utils';
import { getAccount } from 'providers';

const confirmLock = async (
  amountOfSharesWei: bigint,
  dashboardAddress: Address,
) => {
  const { requiredLock, currentLock } = await getRequiredLockByShares(
    dashboardAddress,
    formatEther(amountOfSharesWei),
  );

  const currentWallet = getAccount();
  const LOCK_ROLE = await callReadMethod(
    getDashboardContract(dashboardAddress),
    'LOCK_ROLE',
    undefined,
    { silent: true },
  );
  const currentLockRoles = await callReadMethod(
    getDashboardContract(dashboardAddress),
    'getRoleMembers',
    [LOCK_ROLE],
    undefined,
    { silent: true },
  );

  const isLockRole = currentLockRoles.includes(currentWallet.address);
  if (requiredLock > currentLock) {
    logInfo(
      `Required lock: ${formatEther(requiredLock)} shares, current lock: ${formatEther(currentLock)} shares.
    Auto-lock will be applied to enable minting the required number of shares. LOCK_ROLE is required.`,
    );

    if (!isLockRole) {
      logError(
        "You don't have a LOCK_ROLE. Please add yourself to the LOCK_ROLE.",
      );
      return false;
    }

    const confirm = await confirmOperation('Do you want to continue?');
    if (!confirm) return confirm;
  }

  return true;
};

export const mintShares = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfShares: bigint,
) => {
  const remainingMintingCapacity = await callReadMethod(
    contract,
    'remainingMintingCapacity',
    [0n],
    undefined,
    {
      silent: true,
    },
  );
  if (remainingMintingCapacity < amountOfShares) {
    logError(
      `Cannot mint more shares than the vault can mint. Mintable: ${remainingMintingCapacity}`,
    );
    return;
  }

  const isConfirmedLock = await confirmLock(amountOfShares, contract.address);
  if (!isConfirmedLock) return;

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
  hideSpinner();
  const vault = await callReadMethod(contract, 'stakingVault', undefined, {
    silent: true,
  });

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
