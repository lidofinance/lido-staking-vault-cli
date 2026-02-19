import { getContract, Address, GetContractReturnType } from 'viem';
import { StakingVaultAbi } from 'abi/index.js';
import { getPublicClient, RegisteredPublicClient } from 'providers';

export type StakingVaultContract = GetContractReturnType<
  typeof StakingVaultAbi,
  RegisteredPublicClient
>;

export const getStakingVaultContract = async (
  address: Address,
): Promise<StakingVaultContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address,
    abi: StakingVaultAbi,
    client: publicClient,
  });
};
