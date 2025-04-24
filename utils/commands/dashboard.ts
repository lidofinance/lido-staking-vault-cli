import {
  callWriteMethodWithReceipt,
  confirmBurn,
  confirmOperation,
  getRequiredLockByShares,
} from 'utils';

import { Address, formatEther } from 'viem';

import {
  DashboardContract,
  getDashboardContract,
  getStethContract,
} from 'contracts';
import {
  callReadMethodSilent,
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

export const mintSteth = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfSteth: bigint,
) => {
  const stethContract = await getStethContract();
  const amountOfShares = await callReadMethodSilent(
    stethContract,
    'getSharesByPooledEth',
    [amountOfSteth],
  );

  await mintShares(contract, recipient, amountOfShares, 'mintStETH');
};

export const mintShares = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfShares: bigint,
  method: 'mintShares' | 'mintStETH' | 'mintWstETH',
) => {
  const type =
    method === 'mintShares'
      ? 'shares'
      : method === 'mintStETH'
        ? 'stETH'
        : 'wstETH';

  const remainingMintingCapacity = await callReadMethodSilent(
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

  const isConfirmedLock = await confirmLock(amountOfShares, contract.address);
  if (!isConfirmedLock) return;

  const hideSpinner = showSpinner();
  const {
    currentVaultHealth,
    newVaultHealth,
    newLiabilityShares,
    liabilityShares,
    valueInStethWei,
  } = await fetchAndCalculateVaultHealthWithNewValue(
    contract,
    amountOfShares,
    'mint',
  );
  const vault = await callReadMethodSilent(contract, 'stakingVault');

  hideSpinner();
  const confirm = await confirmMint({
    vaultAddress: vault,
    recipient,
    amountOfMint: amountOfShares,
    amountOfMintInStethWei: valueInStethWei,
    newLiabilityShares: newLiabilityShares,
    currentLiabilityShares: liabilityShares,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
    type,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt(contract, method, [
    recipient,
    amountOfShares,
  ]);
};

export const burnSteth = async (
  contract: DashboardContract,
  amountOfSteth: bigint,
) => {
  const stethContract = await getStethContract();
  const amountOfShares = await callReadMethodSilent(
    stethContract,
    'getSharesByPooledEth',
    [amountOfSteth],
  );

  await burnShares(contract, amountOfShares, 'burnStETH');
};

export const burnShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
  method: 'burnShares' | 'burnStETH' | 'burnWstETH',
) => {
  const type =
    method === 'burnShares'
      ? 'shares'
      : method === 'burnStETH'
        ? 'stETH'
        : 'wstETH';
  const liabilityShares = await callReadMethodSilent(
    contract,
    'liabilityShares',
  );

  if (amountOfShares > liabilityShares) {
    logError('Cannot burn more shares than the vault has');
    return;
  }

  const {
    currentVaultHealth,
    newVaultHealth,
    newLiabilityShares,
    valueInStethWei,
  } = await fetchAndCalculateVaultHealthWithNewValue(
    contract,
    amountOfShares,
    'burn',
  );
  const vault = await callReadMethodSilent(contract, 'stakingVault');

  const confirm = await confirmBurn({
    vaultAddress: vault,
    amountOfBurn: amountOfShares,
    amountOfBurnInStethWei: valueInStethWei,
    newLiabilityShares: newLiabilityShares,
    currentLiabilityShares: liabilityShares,
    newHealthRatio: newVaultHealth.healthRatio,
    currentHealthRatio: currentVaultHealth.healthRatio,
    newIsHealthy: newVaultHealth.isHealthy,
    currentIsHealthy: currentVaultHealth.isHealthy,
    type,
  });
  if (!confirm) return;

  await callWriteMethodWithReceipt(contract, method, [amountOfShares]);
};
