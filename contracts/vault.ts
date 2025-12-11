import {
  getContract,
  Address,
  GetContractReturnType,
  WalletClient,
} from 'viem';
import { StakingVaultAbi } from 'abi/index.js';
import { getPublicClient } from 'providers';

export const getStakingVaultContract = async (
  address: Address,
): Promise<GetContractReturnType<typeof StakingVaultAbi, WalletClient>> => {
  const publicClient = await getPublicClient();

  return getContract({
    address,
    abi: StakingVaultAbi,
    client: publicClient,
  });
};

export type StakingVaultContract = Awaited<
  ReturnType<typeof getStakingVaultContract>
>;
