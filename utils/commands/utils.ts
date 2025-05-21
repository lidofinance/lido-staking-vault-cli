import { Address, formatEther } from 'viem';

import {
  callReadMethodSilent,
  confirmOperation,
  logInfo,
  getRequiredLockByShares,
  logError,
} from 'utils';
import { DashboardContract, getDashboardContract } from 'contracts';
import { getAccount } from 'providers';

export const checkMintingCapacity = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const remainingMintingCapacity = await callReadMethodSilent(
    contract,
    'remainingMintingCapacity',
    [0n],
  );
  if (remainingMintingCapacity < amountOfShares) {
    logError(
      `Cannot mint more shares than the vault can mint. Mintable: ${formatEther(remainingMintingCapacity)}`,
    );
    return false;
  }

  return true;
};

export const checkLiabilityShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
) => {
  const liabilityShares = await callReadMethodSilent(
    contract,
    'liabilityShares',
  );

  if (amountOfShares > liabilityShares) {
    logError('Cannot burn more shares than the liability shares');
    return false;
  }

  return true;
};

export const confirmLock = async (
  amountOfSharesWei: bigint,
  dashboardAddress: Address,
) => {
  const contract = getDashboardContract(dashboardAddress);
  const { requiredLock, currentLock } = await getRequiredLockByShares(
    dashboardAddress,
    formatEther(amountOfSharesWei),
  );
  const currentWallet = getAccount();

  const LOCK_ROLE = await callReadMethodSilent(contract, 'LOCK_ROLE');
  const currentLockRoles = await callReadMethodSilent(
    contract,
    'getRoleMembers',
    [LOCK_ROLE],
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
