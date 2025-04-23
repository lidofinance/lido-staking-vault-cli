import { Address, formatEther } from 'viem';

import { confirmOperation, logInfo } from 'utils';

type ConfirmMintProps = {
  vaultAddress: Address;
  recipient: Address;
  amountOfMint: bigint;
  newLiabilityShares: bigint;
  currentLiabilityShares: bigint;
  newHealthRatio: number;
  currentHealthRatio: number;
  newIsHealthy: boolean;
  currentIsHealthy: boolean;
};

type ConfirmBurnProps = {
  vaultAddress: Address;
  amountOfBurn: bigint;
  newLiabilityShares: bigint;
  currentLiabilityShares: bigint;
  newHealthRatio: number;
  currentHealthRatio: number;
  newIsHealthy: boolean;
  currentIsHealthy: boolean;
};

export const confirmMint = async (props: ConfirmMintProps) => {
  const {
    vaultAddress,
    recipient,
    amountOfMint,
    newLiabilityShares,
    currentLiabilityShares,
    newHealthRatio,
    currentHealthRatio,
    newIsHealthy,
    currentIsHealthy,
  } = props;

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

  logInfo(`Minting ${formatEther(amountOfMint)} shares to ${recipient}:`);
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
    `Are you sure you want to mint ${formatEther(amountOfMint)} shares to ${recipient}?`,
  );

  return confirm;
};

export const confirmBurn = async (props: ConfirmBurnProps) => {
  const {
    vaultAddress,
    amountOfBurn,
    newLiabilityShares,
    currentLiabilityShares,
    newHealthRatio,
    currentHealthRatio,
    newIsHealthy,
    currentIsHealthy,
  } = props;

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

  logInfo(`Burning ${formatEther(amountOfBurn)} shares for ${vaultAddress}:`);
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
    `Are you sure you want to burn ${formatEther(amountOfBurn)} shares for ${vaultAddress}?`,
  );

  return confirm;
};
