import { getContract, GetContractReturnType } from 'viem';
import { VaultFactoryAbi } from 'abi/index.js';
import { getLocatorContract } from 'contracts/locator.js';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export type VaultFactoryContract = GetContractReturnType<
  typeof VaultFactoryAbi,
  RegisteredPublicClient
>;

export const getVaultFactoryContract =
  async (): Promise<VaultFactoryContract> => {
    const publicClient = await getPublicClient();
    const locator = await getLocatorContract();
    const address = await locator.read.vaultFactory();

    return getContract({
      address,
      abi: VaultFactoryAbi,
      client: publicClient,
    });
  };
