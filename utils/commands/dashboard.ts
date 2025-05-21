import { Address } from 'viem';

import { callWriteMethodWithReceipt, confirmBurn } from 'utils';
import { DashboardContract, getStethContract } from 'contracts';
import {
  callReadMethodSilent,
  fetchAndCalculateVaultHealthWithNewValue,
  showSpinner,
  confirmMint,
} from 'utils';

import {
  checkMintingCapacity,
  checkLiabilityShares,
  confirmLock,
  checkIsReportFresh,
} from './utils.js';

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

  const isReportFresh = await checkIsReportFresh(contract);
  if (!isReportFresh) return;

  const isMintingCapacityOk = await checkMintingCapacity(
    contract,
    amountOfShares,
  );
  if (!isMintingCapacityOk) return;

  const isConfirmedLock = await confirmLock(amountOfShares, contract.address);
  if (!isConfirmedLock) return;

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
  const vault = await callReadMethodSilent(contract, 'stakingVault');
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

export const mintShares = async (
  contract: DashboardContract,
  recipient: Address,
  amountOfShares: bigint,
  method: 'mintShares' | 'mintWstETH',
) => {
  const type = method === 'mintShares' ? 'shares' : 'wstETH';

  const isReportFresh = await checkIsReportFresh(contract);
  if (!isReportFresh) return;

  const isMintingCapacityOk = await checkMintingCapacity(
    contract,
    amountOfShares,
  );
  if (!isMintingCapacityOk) return;

  const isConfirmedLock = await confirmLock(amountOfShares, contract.address);
  if (!isConfirmedLock) return;

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
  const vault = await callReadMethodSilent(contract, 'stakingVault');
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

  const isReportFresh = await checkIsReportFresh(contract);
  if (!isReportFresh) return;

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
  const vault = await callReadMethodSilent(contract, 'stakingVault');
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

export const burnShares = async (
  contract: DashboardContract,
  amountOfShares: bigint,
  method: 'burnShares' | 'burnWstETH',
) => {
  const type = method === 'burnShares' ? 'shares' : 'wstETH';

  const isReportFresh = await checkIsReportFresh(contract);
  if (!isReportFresh) return;

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
  const vault = await callReadMethodSilent(contract, 'stakingVault');
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
