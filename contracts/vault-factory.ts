import { getContract, GetContractReturnType } from 'viem';
import { VaultFactoryAbi } from 'abi/index.js';
import { getDeployedAddress } from 'configs';
import { getPublicClient, RegisteredPublicClient } from 'providers/index.js';

export type VaultFactoryContract = GetContractReturnType<
  typeof VaultFactoryAbi,
  RegisteredPublicClient
>;

export const getVaultFactoryContract =
  async (): Promise<VaultFactoryContract> => {
    const publicClient = await getPublicClient();

    return getContract({
      address: getDeployedAddress('stakingVaultFactory'),
      abi: VaultFactoryAbi,
      client: publicClient,
    });
  };
