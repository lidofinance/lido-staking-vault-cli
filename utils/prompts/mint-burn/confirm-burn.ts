import { Address, formatEther } from 'viem';
import Table from 'cli-table3';

import { confirmOperation, logInfo } from 'utils';

import { TABLE_PARAMS } from './constants.js';

type ConfirmBurnProps = {
  vaultAddress: Address;
  amountOfBurn: bigint;
  amountOfBurnInStethWei: bigint;
  newLiabilityShares: bigint;
  newLiabilitySharesInStethWei: bigint;
  currentLiabilityShares: bigint;
  currentLiabilitySharesInStethWei: bigint;
  newHealthRatio: number;
  currentHealthRatio: number;
  newIsHealthy: boolean;
  currentIsHealthy: boolean;
  type: 'shares' | 'stETH' | 'wstETH';
};

export const confirmBurn = async (props: ConfirmBurnProps) => {
  const {
    vaultAddress,
    amountOfBurn,
    amountOfBurnInStethWei,
    newLiabilityShares,
    newLiabilitySharesInStethWei,
    currentLiabilityShares,
    currentLiabilitySharesInStethWei,
    newHealthRatio,
    currentHealthRatio,
    newIsHealthy,
    currentIsHealthy,
    type,
  } = props;

  const amountOfBurnInShares = formatEther(amountOfBurn);
  const amountOfBurnInSteth = formatEther(amountOfBurnInStethWei);
  const isShares = type === 'shares';
  const isWsteth = type === 'wstETH';

  const value =
    isShares || isWsteth ? amountOfBurnInShares : amountOfBurnInSteth;

  const tableCurrent = new Table(TABLE_PARAMS);
  logInfo(`Current vault ${vaultAddress} health:`);
  tableCurrent.push(
    ['Vault Address', vaultAddress],
    ['Current Liability, wei', currentLiabilityShares],
    ['Current Liability, Shares', formatEther(currentLiabilityShares)],
    ['Current Liability, stETH', formatEther(currentLiabilitySharesInStethWei)],
    ['Current Health Ratio', `${currentHealthRatio.toFixed(2)}%`],
    ['Current Is Healthy', currentIsHealthy],
  );
  console.info(tableCurrent.toString());

  const tableNew = new Table(TABLE_PARAMS);
  logInfo(`Burning ${value} ${type} for ${vaultAddress}:`);
  tableNew.push(
    ['Vault Address', vaultAddress],
    ['New Liability, wei', newLiabilityShares],
    ['New Liability, Shares', formatEther(newLiabilityShares)],
    ['New Liability, stETH', formatEther(newLiabilitySharesInStethWei)],
    ['New Health Ratio', `${newHealthRatio.toFixed(2)}%`],
    ['New Is Healthy', newIsHealthy],
  );
  console.info(tableNew.toString());

  const confirm = await confirmOperation(
    `Are you sure you want to burn ${value} ${type} for ${vaultAddress}?`,
  );

  return confirm;
};
