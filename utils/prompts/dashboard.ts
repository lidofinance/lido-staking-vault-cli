import { Address, formatEther } from 'viem';

import { confirmOperation, logInfo } from 'utils';

type ConfirmMintProps = {
  vaultAddress: Address;
  recipient: Address;
  amountOfMint: bigint;
  amountOfMintInStethWei: bigint;
  newLiabilityShares: bigint;
  currentLiabilityShares: bigint;
  newHealthRatio: number;
  currentHealthRatio: number;
  newIsHealthy: boolean;
  currentIsHealthy: boolean;
  type: 'shares' | 'stETH' | 'wstETH';
};

type ConfirmBurnProps = {
  vaultAddress: Address;
  amountOfBurn: bigint;
  amountOfBurnInStethWei: bigint;
  newLiabilityShares: bigint;
  currentLiabilityShares: bigint;
  newHealthRatio: number;
  currentHealthRatio: number;
  newIsHealthy: boolean;
  currentIsHealthy: boolean;
  type: 'shares' | 'stETH' | 'wstETH';
};

export const confirmMint = async (props: ConfirmMintProps) => {
  const {
    vaultAddress,
    recipient,
    amountOfMint,
    amountOfMintInStethWei,
    newLiabilityShares,
    currentLiabilityShares,
    newHealthRatio,
    currentHealthRatio,
    newIsHealthy,
    currentIsHealthy,
    type,
  } = props;

  const amountOfMintInShares = formatEther(amountOfMint);
  const amountOfMintInSteth = formatEther(amountOfMintInStethWei);
  const isShares = type === 'shares';
  const isWsteth = type === 'wstETH';

  const value =
    isShares || isWsteth ? amountOfMintInShares : amountOfMintInSteth;

  logInfo(`Current vault ${vaultAddress} health:`);
  console.table([
    {
      'Vault Address': vaultAddress,
      'Current Liability Shares (wei)': currentLiabilityShares,
      'Current Liability Shares (Shares)': formatEther(currentLiabilityShares),
      'Current Health Ratio': `${currentHealthRatio}%`,
      'Current Is Healthy': currentIsHealthy,
    },
  ]);

  logInfo(`Minting ${value} ${type} to ${recipient}:`);
  console.table([
    {
      'Vault Address': vaultAddress,
      'New Liability Shares (wei)': newLiabilityShares,
      'New Liability Shares (Shares)': formatEther(newLiabilityShares),
      'New Health Ratio': `${newHealthRatio}%`,
      'New Is Healthy': newIsHealthy,
    },
  ]);

  const confirm = await confirmOperation(
    `Are you sure you want to mint ${value} ${type} to ${recipient}?`,
  );

  return confirm;
};

export const confirmBurn = async (props: ConfirmBurnProps) => {
  const {
    vaultAddress,
    amountOfBurn,
    amountOfBurnInStethWei,
    newLiabilityShares,
    currentLiabilityShares,
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

  logInfo(`Current vault ${vaultAddress} health:`);
  console.table([
    {
      'Vault Address': vaultAddress,
      'Current Liability Shares (wei)': currentLiabilityShares,
      'Current Liability Shares (Shares)': formatEther(currentLiabilityShares),
      'Current Health Ratio': `${currentHealthRatio}%`,
      'Current Is Healthy': currentIsHealthy,
    },
  ]);

  logInfo(`Burning ${value} ${type} for ${vaultAddress}:`);
  console.table([
    {
      'Vault Address': vaultAddress,
      'New Liability Shares (wei)': newLiabilityShares,
      'New Liability Shares (Shares)': formatEther(newLiabilityShares),
      'New Health Ratio': `${newHealthRatio}%`,
      'New Is Healthy': newIsHealthy,
    },
  ]);

  const confirm = await confirmOperation(
    `Are you sure you want to burn ${value} ${type} for ${vaultAddress}?`,
  );

  return confirm;
};
