import { Address, formatEther } from 'viem';
import { callReadMethodSilent, confirmOperation, logInfo } from 'utils';
import { getStakingVaultContract, getVaultHubContract } from 'contracts';

export const checkVaultAvailableBalance = async (
  vault: Address,
): Promise<{ isFundConfirmed: boolean }> => {
  const vaultHub = await getVaultHubContract();
  const connectDeposit = await callReadMethodSilent(
    vaultHub,
    'CONNECT_DEPOSIT',
  );

  const vaultContract = await getStakingVaultContract(vault);
  const availableBalance = await callReadMethodSilent(
    vaultContract,
    'availableBalance',
  );

  if (availableBalance < connectDeposit) {
    logInfo(
      `⚠️  Vault available balance is less than connect deposit:
        Available balance: ${formatEther(availableBalance)} ETH
        Connect deposit: ${formatEther(connectDeposit)} ETH`,
    );
    const confirm = await confirmOperation(
      `Do you want to fund the vault with ${formatEther(connectDeposit)} ETH?`,
    );
    if (!confirm) {
      throw new Error('Vault available balance is less than connect deposit');
    }

    return { isFundConfirmed: true };
  }

  return { isFundConfirmed: false };
};
