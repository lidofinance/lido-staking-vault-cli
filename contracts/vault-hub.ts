import { getContract, GetContractReturnType } from 'viem';
import { VaultHubAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts/locator.js';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export type VaultHubContract = GetContractReturnType<
  typeof VaultHubAbi,
  RegisteredPublicClient
>;

export const getVaultHubContract = async (): Promise<VaultHubContract> => {
  const publicClient = await getPublicClient();
  const locator = await getLocatorContract();
  const address = await locator.read.vaultHub();

  return getContract({
    address,
    abi: VaultHubAbi,
    client: publicClient,
  });
};
